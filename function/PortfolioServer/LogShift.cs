using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PortfolioServer.Authentication;
using PortfolioServer.Model;
using PortfolioServer.Services;
using System.Net.Http;
using System.Threading.Tasks;

namespace PortfolioServer
{
    public class LogShift
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public LogShift(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("LogShift")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequestMessage req, ILogger log)
        {
            log.LogInformation("Received log shift request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers.Authorization);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            NewShift newShift;

            try
            {
                newShift = JsonConvert.DeserializeObject<NewShift>(await req.Content.ReadAsStringAsync());
            }
            catch (JsonException)
            {
                return new BadRequestResult();
            }

            var val = new NewShiftValidator();
            var res = await val.ValidateAsync(newShift);

            if (!res.IsValid)
            {
                log.LogInformation("Invalid request received.");
                return new BadRequestResult();
            }

            await _shiftService.AddShift(claims.Identity.Name, newShift);

            return new OkResult();
        }
    }
}
