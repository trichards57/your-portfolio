using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PortfolioServer.Model
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum Outcome
    {
        StoodDown,
        NotFound,
        DischargedOnScene,
        Conveyed,
        Other
    }
}
