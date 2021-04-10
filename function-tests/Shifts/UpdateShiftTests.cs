using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Newtonsoft.Json;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using PortfolioServer.Shifts;
using PortfolioServer.Test.Helpers;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Shifts
{
    public class UpdateShiftTests
    {
        [Fact]
        public async Task ReturnsBadRequestWithInvalidDuration()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewShift>()
                .With(j => j.Duration, TimeSpan.FromHours(-2))
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidEvent()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewShift>()
                .With(j => j.Duration, TimeSpan.FromHours(2))
                .With(j => j.Event, string.Empty)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidJson()
        {
            var body = JsonConvert.SerializeObject("{ invalidjson }");
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidRole()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewShift>()
                .With(j => j.Duration, TimeSpan.FromHours(2))
                .With(j => j.Role, (RoleType)10)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsNotFoundIfInvalidId()
        {
            var fixture = new Fixture();

            var testId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(j => j.Duration, TimeSpan.FromHours(2))
                .With(s => s.Deleted, false)
                .Create();
            var testUpdatedShift = fixture.Build<UpdatedShift>()
                .With(j => j.Id, testOriginalShift.Id)
                .With(j => j.Duration, TimeSpan.FromHours(3))
                .Create();
            var updatedShift = new Shift
            {
                CrewMate = testUpdatedShift.CrewMate,
                Date = testUpdatedShift.Date,
                Duration = testUpdatedShift.Duration,
                Event = testUpdatedShift.Event,
                Id = testUpdatedShift.Id,
                Location = testUpdatedShift.Location,
                Role = testUpdatedShift.Role,
                UserId = testOriginalShift.UserId,
                Jobs = testOriginalShift.Jobs,
                Deleted = false
            };

            var body = JsonConvert.SerializeObject(testUpdatedShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift(AuthenticationHelperMock.GoodUserId, testOriginalShift.Id)).Returns(Task.FromResult<Shift>(null));
            var shiftService = shiftServiceMock.Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task ReturnsOkIfValidRequest()
        {
            var fixture = new Fixture();

            var testId = fixture.Create<string>();
            var testOriginalShift = fixture.Build<Shift>()
                .With(s => s.Deleted, false)
                .With(j => j.Duration, TimeSpan.FromHours(2))
                .Create();
            var testUpdatedShift = fixture.Build<UpdatedShift>()
                .With(j => j.Id, testOriginalShift.Id)
                .With(j => j.Duration, TimeSpan.FromHours(3))
                .Create();
            var updatedShift = new Shift
            {
                CrewMate = testUpdatedShift.CrewMate,
                Date = testUpdatedShift.Date,
                Duration = testUpdatedShift.Duration,
                Event = testUpdatedShift.Event,
                Id = testUpdatedShift.Id,
                Location = testUpdatedShift.Location,
                Role = testUpdatedShift.Role,
                UserId = testOriginalShift.UserId,
                Jobs = testOriginalShift.Jobs,
                Deleted = false
            };

            var body = JsonConvert.SerializeObject(testUpdatedShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift(AuthenticationHelperMock.GoodUserId, testOriginalShift.Id)).ReturnsAsync(testOriginalShift);
            shiftServiceMock.Setup(s => s.UpdateShift(AuthenticationHelperMock.GoodUserId, It.Is<Shift>(u => updatedShift.Equals(u)))).ReturnsAsync(true);
            var shiftService = shiftServiceMock.Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkResult>();

            shiftServiceMock.Verify(s => s.UpdateShift(AuthenticationHelperMock.GoodUserId, It.Is<Shift>(u => updatedShift.Equals(u))));
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new UpdateShift(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
