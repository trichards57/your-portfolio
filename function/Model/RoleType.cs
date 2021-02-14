using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace PortfolioServer.Model
{
    [JsonConverter(typeof(StringEnumConverter))]
    public enum RoleType
    {
        EAC,
        CRU,
        AFA
    }
}
