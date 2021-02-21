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

namespace PortfolioServer.Shifts
{
    public class UpdateShift
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public UpdateShift(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("UpdateShift")]
        public async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Received update shift request.");

            var claims = await _authenticationHelper.DecodeToken(req.Headers["Authorization"]);

            if (claims == null || !claims.Identity.IsAuthenticated)
            {
                log.LogInformation("Unauthorised request received.");
                return new UnauthorizedResult();
            }

            UpdatedShift updatedShift;

            try
            {
                updatedShift = JsonConvert.DeserializeObject<UpdatedShift>(await req.ReadAsStringAsync());
            }
            catch (JsonException)
            {
                return new BadRequestResult();
            }

            var val = new UpdatedShiftValidator();
            var res = await val.ValidateAsync(updatedShift);

            if (!res.IsValid)
            {
                log.LogInformation("Invalid request received.");
                return new BadRequestResult();
            }

            var previousShift = await _shiftService.GetShift(claims.Identity.Name, updatedShift.Id);

            if (previousShift == null)
                return new NotFoundResult();

            previousShift.CrewMate = updatedShift.CrewMate;
            previousShift.Date = updatedShift.Date;
            previousShift.Duration = updatedShift.Duration;
            previousShift.Event = updatedShift.Event;
            previousShift.Location = updatedShift.Location;
            previousShift.Role = updatedShift.Role;

            await _shiftService.UpdateShift(claims.Identity.Name, previousShift);

            return new OkResult();
        }
    }
}
