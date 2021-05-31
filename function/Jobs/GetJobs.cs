using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using PortfolioServer.Authentication;
using PortfolioServer.ResponseModel;
using PortfolioServer.Services;
using System.Linq;
using System.Threading.Tasks;

namespace PortfolioServer.Jobs
{
    public class GetJobs
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public GetJobs(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("GetJobs")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Received shift job request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers["Authorization"]);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            var query = req.Query;

            if (!query.Keys.OfType<string>().Contains("shiftId"))
                return new BadRequestResult();

            var shiftId = query["shiftId"];

            var shift = await _shiftService.GetShift(claims.Identity.Name, shiftId);

            if (shift == null)
                return new NotFoundResult();

            return new OkObjectResult(shift.Jobs.Select(j => new JobSummary
            {
                Id = j.Id,
                Age = j.Age,
                Category = j.Category,
                Gender = j.Gender,
                ReflectionFlag = j.ReflectionFlag
            }));
        }
    }
}
