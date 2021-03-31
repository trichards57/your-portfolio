using Newtonsoft.Json;
using PortfolioServer.Converters;
using PortfolioServer.Model;
using System;

namespace PortfolioServer.ResponseModel
{
    public class ShiftSummary
    {
        [JsonProperty("crewMate")]
        public string CrewMate { get; set; }

        [JsonProperty("date")]
        public DateTime Date { get; set; }

        [JsonProperty("duration"), JsonConverter(typeof(TimespanConverter))]
        public TimeSpan Duration { get; set; }

        [JsonProperty("event")]
        public string Event { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("location")]
        public string Location { get; set; }

        [JsonProperty("loggedCalls")]
        public int LoggedCalls { get; set; }

        [JsonProperty("role")]
        public RoleType Role { get; set; }
    }
}
