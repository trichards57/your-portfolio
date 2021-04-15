﻿using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using PortfolioServer.Shifts;
using PortfolioServer.Test.Helpers;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Shifts
{
    public class UndeleteShiftTests
    {
        [Fact]
        public async Task ReturnsBadRequestWithNoId()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UndeleteShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsNotFoundWithBadId()
        {
            var fixture = new Fixture();
            var testId = fixture.Create<string>();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.UndeleteShift(AuthenticationHelperMock.GoodUserId, testId)).ReturnsAsync(false);
            var shiftService = shiftServiceMock.Object;

            var function = new UndeleteShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?id={testId}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task ReturnsOkWithGoodId()
        {
            var fixture = new Fixture();
            var testShift = fixture.Build<Shift>().With(s => s.Deleted, false).Create();
            var expectedResult = new UpdatedShift
            {
                CrewMate = testShift.CrewMate,
                Date = testShift.Date,
                Duration = testShift.Duration,
                Event = testShift.Event,
                Id = testShift.Id,
                Location = testShift.Location,
                Role = testShift.Role
            };

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.UndeleteShift(AuthenticationHelperMock.GoodUserId, testShift.Id)).ReturnsAsync(true);
            var shiftService = shiftServiceMock.Object;

            var function = new UndeleteShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?id={testShift.Id}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkResult>();
            shiftServiceMock.Verify(s => s.UndeleteShift(AuthenticationHelperMock.GoodUserId, testShift.Id));
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UndeleteShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UndeleteShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
