using FluentValidation;
using System;

namespace PortfolioServer.Model
{
    public class NewShift
    {
        public string CrewMate { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan Duration { get; set; }
        public string Event { get; set; }
        public string Location { get; set; }
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
