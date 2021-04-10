using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PortfolioServer.Model;
using PortfolioServer.ResponseModel;
using PortfolioServer.Services;
using PortfolioServer.Shifts;
using PortfolioServer.Test.Helpers;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Shifts
{
    public class RecentShiftsTests
    {
        [Fact]
        public async Task ReturnsSixShifts()
        {
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = testShifts.Where(s => s.Date.Date <= DateTime.Today).OrderByDescending(s => s.Date).Take(6).Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role,
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new RecentShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new RecentShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new RecentShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
