using Newtonsoft.Json;
using System;

namespace PortfolioServer.Model
{
    public class TimespanConverter : JsonConverter<TimeSpan>
    {
        public override TimeSpan ReadJson(JsonReader reader, Type objectType, TimeSpan existingValue, bool hasExistingValue, JsonSerializer serializer)
        {
            if (reader.Value is long longVal)
                return TimeSpan.FromHours(longVal);
            if (reader.Value is double doubleVal)
                return TimeSpan.FromHours(doubleVal);
            return TimeSpan.Zero;
        }

        public override void WriteJson(JsonWriter writer, TimeSpan value, JsonSerializer serializer)
        {
            writer.WriteValue(value.TotalHours);
        }
    }
}
