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
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Shifts
{
    public class GetAllShiftsTests
    {
        [Fact]
        public async Task ReturnsEmptyIfPageTooLarge()
        {
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = Enumerable.Empty<ShiftSummary>();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?page=10");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
            request.HttpContext.Response.Headers["X-Total-Count"].Should().BeEquivalentTo(new[] { testShifts.Count().ToString() });
        }

        [Fact]
        public async Task ReturnsFirstShiftsIfCountSpecified()
        {
            const int count = 5;
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = testShifts.OrderByDescending(s => s.Date).Take(count).Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?count={count}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
        }

        [Fact]
        public async Task ReturnsFirstTenShiftsIfNotSpecified()
        {
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = testShifts.OrderByDescending(s => s.Date).Take(10).Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
            request.HttpContext.Response.Headers["X-Total-Count"].Should().BeEquivalentTo(new[] { testShifts.Count().ToString() });
        }

        [Fact]
        public async Task ReturnsSecondTwentyIfPageSpecified()
        {
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = testShifts.OrderByDescending(s => s.Date).Skip(10).Take(10).Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?page=1");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
            request.HttpContext.Response.Headers["X-Total-Count"].Should().BeEquivalentTo(new[] { testShifts.Count().ToString() });
        }

        [Fact]
        public async Task ReturnsSpecifiedIfPageAndCountSpecified()
        {
            const int count = 5;
            const int page = 2;
            var fixture = new Fixture();
            var testShifts = fixture.Build<Shift>().With(s => s.Deleted, false).CreateMany(20);
            var expectedShifts = testShifts.OrderByDescending(s => s.Date).Skip(count * page).Take(count).Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetAllShifts(AuthenticationHelperMock.GoodUserId)).ReturnsAsync(testShifts);
            var shiftService = shiftServiceMock.Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?count={count}&page={page}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedShifts);
            request.HttpContext.Response.Headers["X-Total-Count"].Should().BeEquivalentTo(new[] { testShifts.Count().ToString() });
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new GetAllShifts(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
