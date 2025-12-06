using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.Models;
using WhatToEat.API.Services;

namespace WhatToEat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantImportController : ControllerBase
{
    private readonly IYelpService _yelpService;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RestaurantImportController> _logger;

    public RestaurantImportController(
        IYelpService yelpService,
        ApplicationDbContext context,
        ILogger<RestaurantImportController> logger)
    {
        _yelpService = yelpService;
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Import restaurants from Yelp by location name (e.g., "Toronto, ON")
    /// </summary>
    [HttpPost("from-location")]
    public async Task<ActionResult<ImportResult>> ImportFromLocation(
        [FromQuery] string location,
        [FromQuery] int limit = 50,
        [FromQuery] bool skipDuplicates = true)
    {
        try
        {
            var restaurants = new List<Restaurant>();
            var offset = 0;
            var totalFetched = 0;

            // Yelp API limits to 50 per request, so we need to paginate
            while (totalFetched < limit)
            {
                var batchSize = Math.Min(50, limit - totalFetched);
                var batch = await _yelpService.SearchRestaurantsAsync(location, batchSize, offset);

                if (batch.Count == 0)
                    break;

                restaurants.AddRange(batch);
                totalFetched += batch.Count;
                offset += batch.Count;

                // If we got less than requested, we've reached the end
                if (batch.Count < batchSize)
                    break;
            }

            var result = await SaveRestaurants(restaurants, skipDuplicates);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing restaurants from location: {Location}", location);
            return StatusCode(500, new ImportResult
            {
                Success = false,
                Message = $"Error importing restaurants: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Import restaurants from Yelp by coordinates (Toronto: 43.6532, -79.3832)
    /// </summary>
    [HttpPost("from-coordinates")]
    public async Task<ActionResult<ImportResult>> ImportFromCoordinates(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] int radius = 10000,
        [FromQuery] int limit = 50,
        [FromQuery] bool skipDuplicates = true)
    {
        try
        {
            var restaurants = new List<Restaurant>();
            var offset = 0;
            var totalFetched = 0;

            // Yelp API limits to 50 per request, so we need to paginate
            while (totalFetched < limit)
            {
                var batchSize = Math.Min(50, limit - totalFetched);
                var batch = await _yelpService.SearchRestaurantsByCoordinatesAsync(
                    latitude, longitude, radius, batchSize, offset);

                if (batch.Count == 0)
                    break;

                restaurants.AddRange(batch);
                totalFetched += batch.Count;
                offset += batch.Count;

                // If we got less than requested, we've reached the end
                if (batch.Count < batchSize)
                    break;
            }

            var result = await SaveRestaurants(restaurants, skipDuplicates);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing restaurants from coordinates: ({Lat}, {Lng})",
                latitude, longitude);
            return StatusCode(500, new ImportResult
            {
                Success = false,
                Message = $"Error importing restaurants: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Import restaurants from Toronto (convenience endpoint)
    /// Uses Toronto's coordinates: 43.6532°N, 79.3832°W
    /// </summary>
    [HttpPost("from-toronto")]
    public async Task<ActionResult<ImportResult>> ImportFromToronto(
        [FromQuery] int radius = 10000,
        [FromQuery] int limit = 50,
        [FromQuery] bool skipDuplicates = true)
    {
        const double torontoLat = 43.6532;
        const double torontoLng = -79.3832;

        return await ImportFromCoordinates(torontoLat, torontoLng, radius, limit, skipDuplicates);
    }

    private async Task<ImportResult> SaveRestaurants(List<Restaurant> restaurants, bool skipDuplicates)
    {
        var result = new ImportResult
        {
            Success = true,
            TotalFetched = restaurants.Count
        };

        if (restaurants.Count == 0)
        {
            result.Message = "No restaurants found to import";
            return result;
        }

        var saved = 0;
        var skipped = 0;

        foreach (var restaurant in restaurants)
        {
            if (skipDuplicates)
            {
                // Check for duplicates based on name and coordinates
                var exists = await _context.Restaurants.AnyAsync(r =>
                    r.Name == restaurant.Name &&
                    Math.Abs(r.Latitude - restaurant.Latitude) < 0.0001 &&
                    Math.Abs(r.Longitude - restaurant.Longitude) < 0.0001);

                if (exists)
                {
                    skipped++;
                    continue;
                }
            }

            _context.Restaurants.Add(restaurant);
            saved++;
        }

        await _context.SaveChangesAsync();

        result.TotalSaved = saved;
        result.TotalSkipped = skipped;
        result.Message = $"Successfully imported {saved} restaurants. Skipped {skipped} duplicates.";

        return result;
    }
}

public class ImportResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int TotalFetched { get; set; }
    public int TotalSaved { get; set; }
    public int TotalSkipped { get; set; }
}
