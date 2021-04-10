using FluentValidation;
using Newtonsoft.Json;
using PortfolioServer.Converters;
using PortfolioServer.Model;
using System;

namespace PortfolioServer.RequestModel
{
    public class NewShift : IEquatable<NewShift>
    {
        [JsonProperty("crewMate")]
        public string CrewMate { get; set; }

        [JsonProperty("date")]
        public DateTime Date { get; set; }

        [JsonProperty("duration"), JsonConverter(typeof(TimespanConverter))]
        public TimeSpan Duration { get; set; }

        [JsonProperty("event")]
        public string Event { get; set; }

        [JsonProperty("location")]
        public string Location { get; set; }

        [JsonProperty("role")]
        public RoleType Role { get; set; }

        public override bool Equals(object obj)
        {
            return Equals(obj as NewShift);
        }

        public bool Equals(NewShift other)
        {
            return other != null &&
                   CrewMate == other.CrewMate &&
                   Date == other.Date &&
                   Duration.Equals(other.Duration) &&
                   Event == other.Event &&
                   Location == other.Location &&
                   Role == other.Role;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(CrewMate, Date, Duration, Event, Location, Role);
        }
    }

    internal class NewShiftValidator : AbstractValidator<NewShift>
    {
        public NewShiftValidator()
        {
            RuleFor(x => x.Duration).GreaterThan(TimeSpan.Zero);
            RuleFor(x => x.Event).NotEmpty();
            RuleFor(x => x.Role).IsInEnum();
        }
    }
}
