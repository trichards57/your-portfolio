using FluentValidation;
using Newtonsoft.Json;
using PortfolioServer.Model;

namespace PortfolioServer.RequestModel
{
    public class NewJob
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

        [JsonProperty("shift")]
        public string Shift { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is NewJob job)
            {
                return Age == job.Age
                    && BlueLights == job.BlueLights
                    && Category == job.Category
                    && Drove == job.Drove
                    && Gender == job.Gender
                    && Notes == job.Notes
                    && Outcome == job.Outcome
                    && ReflectionFlag == job.ReflectionFlag
                    && Shift == job.Shift;
            }
            return false;
        }
    }

    internal class NewJobValidator : AbstractValidator<NewJob>
    {
        public NewJobValidator()
        {
            RuleFor(x => x.Age).Must(a => a == null || a > 0);
            RuleFor(x => x.Category).InclusiveBetween(1, 5);
            RuleFor(x => x.Outcome).IsInEnum();
            RuleFor(x => x.Shift).NotEmpty();
        }
    }
}
