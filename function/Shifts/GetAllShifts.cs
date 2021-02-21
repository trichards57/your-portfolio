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

namespace PortfolioServer.Shifts
{
    public class GetAllShifts
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public GetAllShifts(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("GetAllShifts")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Received all shift request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers["Authorization"]);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            var countValid = int.TryParse(req.Query["count"], out var count);

            if (!countValid)
                count = 10;

            var pageValid = int.TryParse(req.Query["page"], out var page);
            if (!pageValid)
                page = 0;

            var shifts = await _shiftService.GetAllShifts(claims.Identity.Name);
            req.HttpContext.Response.Headers.Add("X-Total-Count", shifts.Count().ToString());

            shifts = shifts.OrderByDescending(s => s.Date).Skip(page * count).Take(count);

            return new OkObjectResult(shifts.Select(s => new ShiftSummary
            {
                CrewMate = s.CrewMate,
                Date = s.Date,
                Duration = s.Duration,
                Event = s.Event,
                Id = s.Id,
                Location = s.Location,
                LoggedCalls = s.Jobs?.Count ?? 0,
                Role = s.Role
            }));
        }
    }
}
