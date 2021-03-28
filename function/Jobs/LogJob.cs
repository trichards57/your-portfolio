using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using PortfolioServer.Authentication;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using System.Threading.Tasks;

namespace PortfolioServer.Jobs
{
    public class LogJob
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public LogJob(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("LogJob")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Received log job request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers["Authorization"]);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            NewJob newJob;

            try
            {
                newJob = JsonConvert.DeserializeObject<NewJob>(await req.ReadAsStringAsync());
            }
            catch (JsonException)
            {
                return new BadRequestResult();
            }

            var val = new NewJobValidator();
            var res = await val.ValidateAsync(newJob);

            if (!res.IsValid)
            {
                log.LogInformation("Invalid request received.");
                return new BadRequestResult();
            }

            var storeRes = await _shiftService.AddJob(claims.Identity.Name, newJob);

            if (storeRes)
                return new OkResult();
            return new BadRequestResult();
        }
    }
}
