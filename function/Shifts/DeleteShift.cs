using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using PortfolioServer.Authentication;
using PortfolioServer.Services;
using System.Linq;
using System.Threading.Tasks;

namespace PortfolioServer.Shifts
{
    public class DeleteShift
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IShiftService _shiftService;

        public DeleteShift(IShiftService shiftService, IAuthenticationHelper authenticationHelper)
        {
            _shiftService = shiftService;
            _authenticationHelper = authenticationHelper;
        }

        [FunctionName("DeleteShift")]
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req, ILogger log)
        {
            log.LogInformation("Received delete shift request.");

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

            var result = await _shiftService.DeleteShift(claims.Identity.Name, id);

            if (result)
                return new OkResult();
            return new NotFoundResult();
        }
    }
}
