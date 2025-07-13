using Microsoft.AspNetCore.Mvc;
using PruebaDesarrolloAlejandroTellezMarketWatch.Data;
using PruebaDesarrolloAlejandroTellezMarketWatch.Models;

namespace PruebaDesarrolloAlejandroTellezMarketWatch.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class MarketWatchController : Controller
    {
        private readonly AppDbContext _db;

        public MarketWatchController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var symbols = _db.Symbols.Select(s => s.Name).ToList();
            return Ok(new { symbols });
        }

        [HttpPost]
        public IActionResult Add([FromBody] string symbolName)
        {
            _db.Symbols.Add(new Symbol { Name = symbolName });
            _db.SaveChanges();
            return Ok();
        }

        [HttpDelete("{name}")]
        public IActionResult Delete(string name)
        {
            var symbol = _db.Symbols.FirstOrDefault(s => s.Name == name);
            if (symbol == null) return NotFound();

            _db.Symbols.Remove(symbol);
            _db.SaveChanges();
            return Ok();
        }
    }
}
