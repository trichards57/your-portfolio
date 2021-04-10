using Newtonsoft.Json;
using PortfolioServer.Converters;
using System;
using System.Collections.Generic;

namespace PortfolioServer.Model
{
    public class Shift
    {
        [JsonProperty("crewMate")]
        public string CrewMate { get; set; }

        [JsonProperty("date")]
        public DateTime Date { get; set; }

        [JsonProperty("deleted")]
        public bool Deleted { get; set; } = false;

        [JsonProperty("duration"), JsonConverter(typeof(TimespanConverter))]
        public TimeSpan Duration { get; set; }

        [JsonProperty("event")]
        public string Event { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("jobs")]
        public ICollection<Job> Jobs { get; set; } = new List<Job>();

        [JsonProperty("location")]
        public string Location { get; set; }

        [JsonProperty("role")]
        public RoleType Role { get; set; }

        [JsonProperty("userId")]
        public string UserId { get; set; }

        public override bool Equals(object obj)
        {
            if (!(obj is Shift shift))
                return false;

            return CrewMate == shift.CrewMate && Date == shift.Date && Duration == shift.Duration
                && Event == shift.Event && Location == shift.Location && Role == shift.Role && UserId == shift.UserId;
        }

        public bool ShouldSerializeDeleted()
        {
            return Deleted;
        }

        public bool ShouldSerializeJobs()
        {
            return Jobs?.Count > 0;
        }
    }
}
