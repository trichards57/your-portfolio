using FluentValidation;
using Newtonsoft.Json;
using PortfolioServer.Converters;
using PortfolioServer.Model;
using System;

namespace PortfolioServer.RequestModel
{
    public class NewShift
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
            if (!(obj is NewShift shift))
                return false;

            return CrewMate == shift.CrewMate && Date == shift.Date && Duration == shift.Duration
                && Event == shift.Event && Location == shift.Location && Role == shift.Role;
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
