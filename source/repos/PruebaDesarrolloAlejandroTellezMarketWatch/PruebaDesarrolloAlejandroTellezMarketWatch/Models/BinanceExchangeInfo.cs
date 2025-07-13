using Newtonsoft.Json;

namespace PruebaDesarrolloAlejandroTellezMarketWatch.Models
{
    public class BinanceExchangeInfo
    {
        [JsonProperty("symbols")]
        public List<BinanceSymbol> Symbols { get; set; }

    }

    public class BinanceSymbol
    {

        [JsonProperty("symbol")]
        public string SymbolName { get; set; }

    }
}
