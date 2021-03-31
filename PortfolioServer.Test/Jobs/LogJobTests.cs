using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Newtonsoft.Json;
using PortfolioServer.Jobs;
using PortfolioServer.Model;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using PortfolioServer.Test.Helpers;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Jobs
{
    public class LogJobTests
    {
        [Fact]
        public async Task ReturnsBadRequestIfShiftDoesNotExist()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, 1)
                .With(j => j.Category, 1)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.AddJob(AuthenticationHelperMock.GoodUserId, It.Is<NewJob>(j => j.Equals(testShift)))).ReturnsAsync(false);
            var shiftService = shiftServiceMock.Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidAge()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, -1)
                .With(j => j.Category, 1)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidCategory()
        {
            var fixture = new Fixture();

            var body = JsonConvert.SerializeObject("{ invalidjson }");
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidJson()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, -1)
                .With(j => j.Category, 1)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithInvalidOutcome()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, 1)
                .With(j => j.Category, 1)
                .With(j => j.Outcome, (Outcome)10)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsBadRequestWithNoShift()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, 1)
                .With(j => j.Category, 1)
                .With(j => j.Shift, string.Empty)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsOkIfValidRequest()
        {
            var fixture = new Fixture();

            var testShift = fixture.Build<NewJob>()
                .With(j => j.Age, 1)
                .With(j => j.Category, 1)
                .Create();

            var body = JsonConvert.SerializeObject(testShift);
            var bodyArray = Encoding.UTF8.GetBytes(body);
            var bodyStream = new MemoryStream(bodyArray);

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.AddJob(AuthenticationHelperMock.GoodUserId, It.Is<NewJob>(j => j.Equals(testShift)))).ReturnsAsync(true);
            var shiftService = shiftServiceMock.Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.Body = bodyStream;

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkResult>();

            shiftServiceMock.Verify(s => s.AddJob(AuthenticationHelperMock.GoodUserId, It.Is<NewJob>(j => j.Equals(testShift))));
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new LogJob(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
