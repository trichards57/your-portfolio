using AutoFixture;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using PortfolioServer.Jobs;
using PortfolioServer.Model;
using PortfolioServer.ResponseModel;
using PortfolioServer.Services;
using PortfolioServer.Test.Helpers;
using System.Linq;
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

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<BadRequestResult>();
        }

        [Fact]
        public async Task ReturnsEmptyListIfNoJobs()
        {
            var fixture = new Fixture();
            var testShift = fixture.Build<Shift>().With(s => s.Deleted, false).Create();
            testShift.Jobs.Clear();
            var expectedJobs = Enumerable.Empty<JobSummary>();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift(AuthenticationHelperMock.GoodUserId, testShift.Id)).Returns(Task.FromResult(testShift));
            var shiftService = shiftServiceMock.Object;

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedJobs);
        }

        [Fact]
        public async Task ReturnsJobsIfFound()
        {
            var fixture = new Fixture();
            var testShift = fixture.Build<Shift>().With(s => s.Deleted, false).Create();
            var expectedJobs = testShift.Jobs.Select(j => new JobSummary
            {
                Age = j.Age,
                Category = j.Category,
                Gender = j.Gender,
                ReflectionFlag = j.ReflectionFlag
            });

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift(AuthenticationHelperMock.GoodUserId, testShift.Id)).Returns(Task.FromResult<Shift>(testShift));
            var shiftService = shiftServiceMock.Object;

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeEquivalentTo(expectedJobs);
        }

        [Fact]
        public async Task ReturnsNotFoundRequestIfNoShift()
        {
            var fixture = new Fixture();
            var testShift = fixture.Build<Shift>().With(s => s.Deleted, false).Create();

            var shiftServiceMock = new Mock<IShiftService>(MockBehavior.Strict);
            shiftServiceMock.Setup(s => s.GetShift(AuthenticationHelperMock.GoodUserId, testShift.Id)).Returns(Task.FromResult<Shift>(null));
            var shiftService = shiftServiceMock.Object;

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.GoodHeader);
            request.QueryString = new QueryString($"?shiftId={testShift.Id}");

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<NotFoundResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithBadClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());
            request.Headers.Add("Authorization", AuthenticationHelperMock.BadHeader);

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }

        [Fact]
        public async Task ReturnsUnauthorisedWithNoClaims()
        {
            var shiftService = new Mock<IShiftService>(MockBehavior.Strict).Object;

            var function = new GetJobs(shiftService, AuthenticationHelperMock.GetAuthenticationHelper());

            var request = new DefaultHttpRequest(new DefaultHttpContext());

            var result = await function.Run(request, NullLogger.Instance);

            result.Should().BeOfType<UnauthorizedResult>();
        }
    }
}
