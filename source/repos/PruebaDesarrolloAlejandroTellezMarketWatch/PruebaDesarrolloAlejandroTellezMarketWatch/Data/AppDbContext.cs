using Microsoft.EntityFrameworkCore;
using PruebaDesarrolloAlejandroTellezMarketWatch.Models;

namespace PruebaDesarrolloAlejandroTellezMarketWatch.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Symbol> Symbols { get; set; }
    }
}