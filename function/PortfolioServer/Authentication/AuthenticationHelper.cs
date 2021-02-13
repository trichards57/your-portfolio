using JWT.Builder;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace PortfolioServer.Authentication
{
    public interface IAuthenticationHelper
    {
        bool IsValid { get; }
        string UserId { get; }

        bool DecodeToken(HttpRequest request);
    }

    internal class AuthenticationHelper : IAuthenticationHelper
    {
        public bool IsValid { get; private set; }
        public string UserId { get; private set; }

        public bool DecodeToken(HttpRequest request)
        {
            if (!request.Headers.ContainsKey("Authorization"))
            {
                IsValid = false;
                return false;
            }

            var header = (string)request.Headers["Authorization"];

            if (string.IsNullOrWhiteSpace(header) || !header.StartsWith("Bearer"))
            {
                IsValid = false;
                return false;
            }

            header = header[7..];

            IDictionary<string, object> claims;

            try
            {
                claims = new JwtBuilder().MustVerifySignature().Decode<IDictionary<string, object>>(header);
            }
            catch (Exception)
            {
                IsValid = false;
                return false;
            }

            if (!claims.ContainsKey("sub"))
            {
                IsValid = false;
                return false;
            }

            UserId = Convert.ToString(claims["sub"]);
            IsValid = true;
            return true;
        }
    }
}
