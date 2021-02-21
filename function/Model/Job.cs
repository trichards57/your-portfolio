using Newtonsoft.Json;

namespace PortfolioServer.Model
{
    public class Job
    {
        [JsonProperty("age")]
        public int? Age { get; set; }

        [JsonProperty("blueLights")]
        public bool BlueLights { get; set; }

        [JsonProperty("category")]
        public int Category { get; set; }

        [JsonProperty("drove")]
        public bool Drove { get; set; }

        [JsonProperty("gender")]
        public Gender? Gender { get; set; }

        [JsonProperty("notes")]
        public string Notes { get; set; }

        [JsonProperty("outcome")]
        public Outcome Outcome { get; set; }

        [JsonProperty("reflectionFlag")]
        public bool ReflectionFlag { get; set; }
    }
}
