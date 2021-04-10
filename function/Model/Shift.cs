using Newtonsoft.Json;
using PortfolioServer.Converters;
using System;
using System.Collections.Generic;

namespace PortfolioServer.Model
{
    public class Shift : IEquatable<Shift>
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

        public bool Equals(Shift other)
        {
            return other != null &&
                   CrewMate == other.CrewMate &&
                   Date == other.Date &&
                   Deleted == other.Deleted &&
                   Duration.Equals(other.Duration) &&
                   Event == other.Event &&
                   Id == other.Id &&
                   Location == other.Location &&
                   Role == other.Role &&
                   UserId == other.UserId;
        }

        public override bool Equals(object obj)
        {
            return Equals(obj as Shift);
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(CrewMate);
            hash.Add(Date);
            hash.Add(Deleted);
            hash.Add(Duration);
            hash.Add(Event);
            hash.Add(Id);
            hash.Add(Jobs);
            hash.Add(Location);
            hash.Add(Role);
            hash.Add(UserId);
            return hash.ToHashCode();
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
