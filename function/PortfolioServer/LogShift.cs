using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using PortfolioServer.Authentication;
using PortfolioServer.Model;
using PortfolioServer.Services;
using System.Text.Json;
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
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req, ILogger log)
        {
            log.LogInformation("Received log shift request.");

            if (!_authenticationHelper.DecodeToken(req))
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            NewShift newShift;

            try
            {
                newShift = await JsonSerializer.DeserializeAsync<NewShift>(req.Body);
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

            await _shiftService.AddShift(_authenticationHelper.UserId, newShift);

            return new OkResult();
        }
    }
}
