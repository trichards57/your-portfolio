using Newtonsoft.Json;
using PortfolioServer.Model;

namespace PortfolioServer.ResponseModel
{
    public class JobSummary
    {
        [JsonProperty("age")]
        public int? Age { get; set; }

        [JsonProperty("category")]
        public int Category { get; set; }

        [JsonProperty("gender")]
        public Gender? Gender { get; set; }

        [JsonProperty("reflectionFlag")]
        public bool ReflectionFlag { get; set; }
    }
}
