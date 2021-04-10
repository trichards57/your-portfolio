using FluentValidation;
using Newtonsoft.Json;
using PortfolioServer.Model;
using System;

namespace PortfolioServer.RequestModel
{
    public class NewJob : IEquatable<NewJob>
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
            return Equals(obj as NewJob);
        }

        public bool Equals(NewJob other)
        {
            return other != null &&
                   Age == other.Age &&
                   BlueLights == other.BlueLights &&
                   Category == other.Category &&
                   Drove == other.Drove &&
                   Gender == other.Gender &&
                   Notes == other.Notes &&
                   Outcome == other.Outcome &&
                   ReflectionFlag == other.ReflectionFlag &&
                   Shift == other.Shift;
        }

        public override int GetHashCode()
        {
            var hash = new HashCode();
            hash.Add(Age);
            hash.Add(BlueLights);
            hash.Add(Category);
            hash.Add(Drove);
            hash.Add(Gender);
            hash.Add(Notes);
            hash.Add(Outcome);
            hash.Add(ReflectionFlag);
            hash.Add(Shift);
            return hash.ToHashCode();
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
