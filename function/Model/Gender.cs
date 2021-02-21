using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PortfolioServer.Model
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum Gender
    {
        Male = 1,
        Female = 2
    }
}
