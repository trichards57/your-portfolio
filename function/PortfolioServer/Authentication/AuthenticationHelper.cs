using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;

namespace PortfolioServer.Authentication
{
    public interface IAuthenticationHelper
    {
        bool IsValid { get; }
        string UserId { get; }

        Task<ClaimsPrincipal> DecodeToken(AuthenticationHeaderValue value);
    }

    internal class AuthenticationHelper : IAuthenticationHelper
    {
        private readonly IConfigurationManager<OpenIdConnectConfiguration> _configurationManager;
        private readonly string Audience = "https://tr-toolbox.me.uk/your-portfolio";
        private readonly string Issuer = "https://tr-toolbox.eu.auth0.com/";

        public AuthenticationHelper()
        {
            var documentRetriever = new HttpDocumentRetriever { RequireHttps = Issuer.StartsWith("https://") };

            _configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{Issuer}.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever(),
                documentRetriever
            );
        }

        public bool IsValid { get; private set; }
        public string UserId { get; private set; }

        public async Task<ClaimsPrincipal> DecodeToken(AuthenticationHeaderValue value)
        {
            if (value?.Scheme != "Bearer")
                return null;

            var config = await _configurationManager.GetConfigurationAsync(CancellationToken.None);

            var validationParameter = new TokenValidationParameters
            {
                RequireSignedTokens = true,
                ValidAudience = Audience,
                ValidateAudience = true,
                ValidIssuer = Issuer,
                ValidateIssuer = true,
                ValidateIssuerSigningKey = true,
                ValidateLifetime = true,
                IssuerSigningKeys = config.SigningKeys,
                NameClaimType = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            };

            ClaimsPrincipal result = null;
            var tries = 0;

            while (result == null && tries <= 1)
            {
                try
                {
                    var handler = new JwtSecurityTokenHandler();
                    result = handler.ValidateToken(value.Parameter, validationParameter, out var token);
                }
                catch (SecurityTokenSignatureKeyNotFoundException)
                {
                    // This exception is thrown if the signature key of the JWT could not be found.
                    // This could be the case when the issuer changed its signing keys, so we trigger a
                    // refresh and retry validation.
                    _configurationManager.RequestRefresh();
                    tries++;
                }
                catch (SecurityTokenException)
                {
                    return null;
                }
            }

            return result;
        }
    }
}
