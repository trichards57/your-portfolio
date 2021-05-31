using Newtonsoft.Json;
using System;

namespace PortfolioServer.Model
{
    public class Job : IEquatable<Job>
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

        [JsonProperty]
        public string Id { get; set; }

        [JsonProperty("notes")]
        public string Notes { get; set; }

        [JsonProperty("outcome")]
        public Outcome Outcome { get; set; }

        [JsonProperty("reflectionFlag")]
        public bool ReflectionFlag { get; set; }

        public override bool Equals(object obj)
        {
            return Equals(obj as Job);
        }

        public bool Equals(Job other)
        {
            return other != null &&
                   Age == other.Age &&
                   BlueLights == other.BlueLights &&
                   Category == other.Category &&
                   Drove == other.Drove &&
                   Gender == other.Gender &&
                   Notes == other.Notes &&
                   Outcome == other.Outcome &&
                   ReflectionFlag == other.ReflectionFlag;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(Age, BlueLights, Category, Drove, Gender, Notes, Outcome, ReflectionFlag);
        }
    }
}
