using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using PortfolioServer.Authentication;
using PortfolioServer.ResponseModel;
using PortfolioServer.Services;
using System;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace PortfolioServer.Shifts
{
    public class RecentShifts
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public RecentShifts(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("RecentShifts")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequestMessage req,
            ILogger log)
        {
            log.LogInformation("Received recent shift request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers.Authorization);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            var shifts = await _shiftService.GetAllShifts(claims.Identity.Name);
            shifts = shifts.Where(s => s.Date.Date <= DateTime.Today)
                .OrderByDescending(s => s.Date).Take(6);

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
