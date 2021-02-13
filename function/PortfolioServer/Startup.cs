using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using PortfolioServer.Authentication;
using PortfolioServer.Services;

[assembly: FunctionsStartup(typeof(PortfolioServer.Startup))]

namespace PortfolioServer
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton(c =>
            {
                var endpoint = System.Environment.GetEnvironmentVariable("DB_ENDPOINT");
                var key = System.Environment.GetEnvironmentVariable("DB_KEY");

                return new CosmosClient(endpoint, key, new CosmosClientOptions
                {
                    ApplicationName = "ShiftsServer",
                });
            });
            builder.Services.AddScoped<IShiftService, ShiftService>();
            builder.Services.AddScoped<IAuthenticationHelper, AuthenticationHelper>();
        }
    }
}
