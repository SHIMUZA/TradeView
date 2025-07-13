using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PruebaDesarrolloAlejandroTellezMarketWatch.Data;
using PruebaDesarrolloAlejandroTellezMarketWatch.Models;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configuración de servicios
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddAuthorization();

// Configuración de la base de datos (SQL Server)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
    .EnableSensitiveDataLogging()
    .LogTo(Console.WriteLine));

// Configuración de HttpClient para Binance
builder.Services.AddHttpClient();

// Configuración de servicios
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Configuración CORS explícita
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactLocal", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Solo este origen
              .AllowAnyHeader()
              .AllowAnyMethod()
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight
    });
});

var app = builder.Build();

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}


// Orden CRUCIAL del middleware
//app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("ReactLocal");
app.UseAuthorization();
app.MapControllers();




// Endpoint para obtener símbolos públicos de Binance
app.MapGet("/public-symbols", async (HttpClient httpClient) =>
{
    try
    {
        var response = await httpClient.GetAsync("https://api.binance.com/api/v3/exchangeInfo");
        if (!response.IsSuccessStatusCode)
            return Results.StatusCode((int)response.StatusCode);

        var content = await response.Content.ReadFromJsonAsync<BinanceExchangeInfo>();
        var symbols = content?.Symbols?.Select(s => s.SymbolName).ToArray() ?? Array.Empty<string>();

        return Results.Ok(new { symbols });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

// CRUD
// GET
app.MapGet("/market-watch", async (AppDbContext db) =>
{
    var symbols = await db.Symbols.Select(s => s.Name).ToListAsync();
    return Results.Ok(new { symbols });
});

// POST
app.MapPost("/market-watch", async ([FromBody] AddSymbolRequest request, AppDbContext db) =>
{
    // Validación robusta
    if (request == null || string.IsNullOrWhiteSpace(request.Name))
    {
        return Results.BadRequest("Symbol name is required");
    }

    // Limpieza del input
    var symbolName = request.Name.Trim().ToUpper();

    if (await db.Symbols.AnyAsync(s => s.Name == symbolName))
    {
        return Results.Conflict("Symbol already exists");
    }

    await db.Symbols.AddAsync(new Symbol { Name = symbolName });
    await db.SaveChangesAsync();

    return Results.Ok(new { success = true });
});


//public record AddSymbolRequest(string Name);

// DELETE
app.MapDelete("/market-watch/{name}", async (string name, AppDbContext db) =>
{
    try
    {
        var normalizedName = name.Trim().ToUpper();
        var symbol = await db.Symbols.FirstOrDefaultAsync(s => s.Name == normalizedName);

        if (symbol == null)
            return Results.NotFound(new { message = "Symbol not found" });

        db.Symbols.Remove(symbol);
        await db.SaveChangesAsync();

        return Results.Ok(new { success = true, message = "Symbol deleted successfully" });
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message, statusCode: 500);
    }
});

app.Run();

// Modelos para Binance API

public record AddSymbolRequest(string Name);

public class BinanceExchangeInfo
{
    public List<BinanceSymbol>? Symbols { get; set; }
}

public class BinanceSymbol
{
    [JsonPropertyName("symbol")]
    public string? SymbolName { get; set; }
}