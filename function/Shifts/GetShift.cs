using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using PortfolioServer.Authentication;
using PortfolioServer.RequestModel;
using PortfolioServer.Services;
using System.Linq;
using System.Threading.Tasks;

namespace PortfolioServer.Shifts
{
    public class GetShift
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public GetShift(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("GetShift")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Received specific shift request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers["Authorization"]);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            var query = req.Query;

            if (!query.Keys.OfType<string>().Contains("id"))
                return new BadRequestResult();

            var id = query["id"];

            var shift = await _shiftService.GetShift(claims.Identity.Name, id);

            if (shift == null)
                return new NotFoundResult();

            return new OkObjectResult(new UpdatedShift
            {
                CrewMate = shift.CrewMate,
                Date = shift.Date,
                Duration = shift.Duration,
                Event = shift.Event,
                Id = shift.Id,
                Location = shift.Location,
                Role = shift.Role
            });
        }
    }
}
