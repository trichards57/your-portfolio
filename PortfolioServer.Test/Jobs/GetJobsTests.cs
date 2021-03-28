using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PortfolioServer.Authentication;
using PortfolioServer.Jobs;
using PortfolioServer.Model;
using PortfolioServer.ResponseModel;
using PortfolioServer.Services;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Xunit;

namespace PortfolioServer.Test.Jobs
{
    public class GetJobsTests
    {
        [Fact]
        public async Task ReturnsBadRequestIfNoShiftId()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;
            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            var testClaims = new ClaimsIdentity("TestAuth");
            authenticationHelperMock.Setup(h => h.DecodeToken("GoodHeader")).ReturnsAsync(new ClaimsPrincipal(testClaims));
            var authenticationHelper = authenticationHelperMock.Object;
            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", "GoodHeader");

            var result = await function.Run(request, logger);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsEmptyListIfNoJobs()
        {
            var fixture = new Fixture();
            var testShift = fixture.Create<Shift>();
            testShift.Jobs.Clear();
            var expectedJobs = Enumerable.Empty<JobSummary>();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift("UserId", testShift.Id)).Returns(Task.FromResult<Shift>(testShift));
            var shiftService = shiftServiceMock.Object;

            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            var testClaims = new ClaimsIdentity("TestAuth");
            testClaims.AddClaim(new Claim(ClaimTypes.Name, "UserId"));
            authenticationHelperMock.Setup(h => h.DecodeToken("GoodHeader")).ReturnsAsync(new ClaimsPrincipal(testClaims));
            var authenticationHelper = authenticationHelperMock.Object;

            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", "GoodHeader");
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, logger);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedJobs);
        }

        [Fact]
        public async Task ReturnsJobsIfFound()
        {
            var fixture = new Fixture();
            var testShift = fixture.Create<Shift>();
            var expectedJobs = testShift.Jobs.Select(j => new JobSummary
            {
                Age = j.Age,
                Category = j.Category,
                Gender = j.Gender,
                ReflectionFlag = j.ReflectionFlag
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift("UserId", testShift.Id)).Returns(Task.FromResult<Shift>(testShift));
            var shiftService = shiftServiceMock.Object;

            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            var testClaims = new ClaimsIdentity("TestAuth");
            testClaims.AddClaim(new Claim(ClaimTypes.Name, "UserId"));
            authenticationHelperMock.Setup(h => h.DecodeToken("GoodHeader")).ReturnsAsync(new ClaimsPrincipal(testClaims));
            var authenticationHelper = authenticationHelperMock.Object;

            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", "GoodHeader");
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, logger);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedJobs);
        }

        [Fact]
        public async Task ReturnsNotFoundRequestIfNoShift()
        {
            var fixture = new Fixture();
            var testShift = fixture.Create<Shift>();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift("UserId", testShift.Id)).Returns(Task.FromResult<Shift>(null));
            var shiftService = shiftServiceMock.Object;

            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            var testClaims = new ClaimsIdentity("TestAuth");
            testClaims.AddClaim(new Claim(ClaimTypes.Name, "UserId"));
            authenticationHelperMock.Setup(h => h.DecodeToken("GoodHeader")).ReturnsAsync(new ClaimsPrincipal(testClaims));
            var authenticationHelper = authenticationHelperMock.Object;

            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", "GoodHeader");
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, logger);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;
            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            var testClaims = new ClaimsIdentity();
            authenticationHelperMock.Setup(h => h.DecodeToken("BadHeader")).ReturnsAsync(new ClaimsPrincipal(testClaims));
            var authenticationHelper = authenticationHelperMock.Object;
            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", "BadHeader");

            var result = await function.Run(request, logger);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;
            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);
            authenticationHelperMock.Setup(h => h.DecodeToken(null)).Returns(Task.FromResult<ClaimsPrincipal>(null));
            var authenticationHelper = authenticationHelperMock.Object;
            var logger = NullLogger.Instance;

            var function = new GetJobs(shiftService, authenticationHelper);

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, logger);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
