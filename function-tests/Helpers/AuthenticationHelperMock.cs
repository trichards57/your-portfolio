using Moq;
using PortfolioServer.Authentication;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PortfolioServer.Test.Helpers
{
    public static class AuthenticationHelperMock
    {
        public const string BadHeader = "BadHeader";
        public const string GoodHeader = "GoodHeader";
        public const string GoodUserId = "UserId";

        public static IAuthenticationHelper GetAuthenticationHelper()
        {
            var authenticationHelperMock = new Mock<IAuthenticationHelper>(MockBehavior.Strict);

            var goodClaims = new ClaimsIdentity("TestAuth");
            goodClaims.AddClaim(new Claim(ClaimTypes.Name, GoodUserId));

            var badClaims = new ClaimsIdentity();

            authenticationHelperMock.Setup(h => h.DecodeToken(BadHeader)).ReturnsAsync(new ClaimsPrincipal(badClaims));
            authenticationHelperMock.Setup(h => h.DecodeToken(null)).Returns(Task.FromResult<ClaimsPrincipal>(null));
            authenticationHelperMock.Setup(h => h.DecodeToken(GoodHeader)).ReturnsAsync(new ClaimsPrincipal(goodClaims));

            return authenticationHelperMock.Object;
        }
    }
}
