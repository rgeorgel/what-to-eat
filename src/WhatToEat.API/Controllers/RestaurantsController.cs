using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.Models;

namespace WhatToEat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<RestaurantsController> _logger;

    public RestaurantsController(ApplicationDbContext context, ILogger<RestaurantsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Get all restaurants
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Restaurant>>> GetRestaurants()
    {
        return await _context.Restaurants.ToListAsync();
    }

    /// <summary>
    /// Get restaurant by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Restaurant>> GetRestaurant(int id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);

        if (restaurant == null)
        {
            return NotFound();
        }

        return restaurant;
    }

    /// <summary>
    /// Search restaurants by category, cuisine type, or name
    /// </summary>
    [HttpGet("search")]
    public async Task<ActionResult<IEnumerable<Restaurant>>> SearchRestaurants(
        [FromQuery] string? query,
        [FromQuery] string? category,
        [FromQuery] string? cuisineType,
        [FromQuery] string? province)
    {
        var restaurantsQuery = _context.Restaurants.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query))
        {
            var searchTerm = query.ToLower();
            restaurantsQuery = restaurantsQuery.Where(r =>
                r.Name.ToLower().Contains(searchTerm) ||
                r.Category.ToLower().Contains(searchTerm) ||
                r.CuisineType.ToLower().Contains(searchTerm) ||
                (r.Description != null && r.Description.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            restaurantsQuery = restaurantsQuery.Where(r =>
                r.Category.ToLower().Contains(category.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(cuisineType))
        {
            restaurantsQuery = restaurantsQuery.Where(r =>
                r.CuisineType.ToLower().Contains(cuisineType.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(province))
        {
            restaurantsQuery = restaurantsQuery.Where(r =>
                r.Province.ToLower() == province.ToLower());
        }

        var restaurants = await restaurantsQuery.ToListAsync();
        return restaurants;
    }

    /// <summary>
    /// Get restaurants near a location within specified radius (in kilometers)
    /// </summary>
    [HttpGet("nearby")]
    public async Task<ActionResult<IEnumerable<Restaurant>>> GetNearbyRestaurants(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] double radiusKm = 5.0,
        [FromQuery] string? category = null,
        [FromQuery] string? province = null)
    {
        var query = _context.Restaurants.AsQueryable();

        // Filter by province if specified
        if (!string.IsNullOrWhiteSpace(province))
        {
            query = query.Where(r => r.Province.ToLower() == province.ToLower());
        }

        var allRestaurants = await query.ToListAsync();

        // Filter by category if specified
        if (!string.IsNullOrWhiteSpace(category))
        {
            allRestaurants = allRestaurants
                .Where(r => r.Category.ToLower().Contains(category.ToLower()))
                .ToList();
        }

        // Calculate distance and filter
        var nearbyRestaurants = allRestaurants
            .Select(r => new
            {
                Restaurant = r,
                Distance = CalculateDistance(latitude, longitude, r.Latitude, r.Longitude)
            })
            .Where(x => x.Distance <= radiusKm)
            .OrderBy(x => x.Distance)
            .Select(x => x.Restaurant)
            .ToList();

        return nearbyRestaurants;
    }

    /// <summary>
    /// Get unique categories
    /// </summary>
    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Restaurants
            .Select(r => r.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return categories;
    }

    /// <summary>
    /// Get unique cuisine types
    /// </summary>
    [HttpGet("cuisine-types")]
    public async Task<ActionResult<IEnumerable<string>>> GetCuisineTypes()
    {
        var cuisineTypes = await _context.Restaurants
            .Select(r => r.CuisineType)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return cuisineTypes;
    }

    /// <summary>
    /// Get unique provinces
    /// </summary>
    [HttpGet("provinces")]
    public async Task<ActionResult<IEnumerable<string>>> GetProvinces()
    {
        var provinces = await _context.Restaurants
            .Select(r => r.Province)
            .Distinct()
            .OrderBy(p => p)
            .ToListAsync();

        return provinces;
    }

    /// <summary>
    /// Calculate distance between two coordinates using Haversine formula
    /// </summary>
    private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double earthRadiusKm = 6371.0;

        var dLat = DegreesToRadians(lat2 - lat1);
        var dLon = DegreesToRadians(lon2 - lon1);

        lat1 = DegreesToRadians(lat1);
        lat2 = DegreesToRadians(lat2);

        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2) * Math.Cos(lat1) * Math.Cos(lat2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return earthRadiusKm * c;
    }

    private double DegreesToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }

    /// <summary>
    /// Create a new restaurant (for admin purposes)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Restaurant>> CreateRestaurant(Restaurant restaurant)
    {
        restaurant.CreatedAt = DateTime.UtcNow;
        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRestaurant), new { id = restaurant.Id }, restaurant);
    }

    /// <summary>
    /// Update a restaurant
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRestaurant(int id, Restaurant restaurant)
    {
        if (id != restaurant.Id)
        {
            return BadRequest();
        }

        _context.Entry(restaurant).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await RestaurantExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    /// <summary>
    /// Delete a restaurant
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestaurant(int id)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null)
        {
            return NotFound();
        }

        _context.Restaurants.Remove(restaurant);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> RestaurantExists(int id)
    {
        return await _context.Restaurants.AnyAsync(e => e.Id == id);
    }

    /// <summary>
    /// Get a random restaurant based on optional filters
    /// </summary>
    [HttpGet("random")]
    public async Task<ActionResult<Restaurant>> GetRandomRestaurant(
        [FromQuery] double? latitude,
        [FromQuery] double? longitude,
        [FromQuery] double? radiusKm,
        [FromQuery] string? category,
        [FromQuery] string? cuisineType,
        [FromQuery] decimal? minRating,
        [FromQuery] string? province)
    {
        var query = _context.Restaurants.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(r => r.Category.ToLower().Contains(category.ToLower()));
        }

        if (!string.IsNullOrWhiteSpace(cuisineType))
        {
            query = query.Where(r => r.CuisineType.ToLower().Contains(cuisineType.ToLower()));
        }

        if (minRating.HasValue)
        {
            query = query.Where(r => r.Rating >= minRating.Value);
        }

        if (!string.IsNullOrWhiteSpace(province))
        {
            query = query.Where(r => r.Province.ToLower() == province.ToLower());
        }

        var restaurants = await query.ToListAsync();

        // Filter by location if provided
        if (latitude.HasValue && longitude.HasValue && radiusKm.HasValue)
        {
            restaurants = restaurants
                .Where(r => CalculateDistance(latitude.Value, longitude.Value, r.Latitude, r.Longitude) <= radiusKm.Value)
                .ToList();
        }

        if (!restaurants.Any())
        {
            return NotFound(new { message = "No restaurants found matching the criteria" });
        }

        // Select random restaurant
        var random = new Random();
        var randomRestaurant = restaurants[random.Next(restaurants.Count)];

        return randomRestaurant;
    }
}
