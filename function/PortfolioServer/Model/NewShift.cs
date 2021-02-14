using FluentValidation;
using Newtonsoft.Json;
using System;

namespace PortfolioServer.Model
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
