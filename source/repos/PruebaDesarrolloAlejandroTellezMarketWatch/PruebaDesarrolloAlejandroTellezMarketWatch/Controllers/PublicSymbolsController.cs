using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using PruebaDesarrolloAlejandroTellezMarketWatch.Models;

namespace PruebaDesarrolloAlejandroTellezMarketWatch.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PublicSymbolsController : Controller
    {
        private readonly HttpClient _httpClient;

        public PublicSymbolsController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var response = await _httpClient.GetAsync("https://api.binance.com/api/v3/exchangeInfo");
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode);

            var content = await response.Content.ReadAsStringAsync();
            var exchangeInfo = JsonConvert.DeserializeObject<BinanceExchangeInfo>(content);

            var symbols = exchangeInfo.Symbols.Select(s => s.SymbolName).ToList();
            return Ok(new { symbols });
        }

    }
}
