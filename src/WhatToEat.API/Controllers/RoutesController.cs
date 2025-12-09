using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.DTOs.Routes;
using WhatToEat.API.Models;

namespace WhatToEat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoutesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public RoutesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Get all routes for the current user
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RouteItineraryDto>>> GetMyRoutes()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var routes = await _context.RouteItineraries
            .Include(ri => ri.User)
            .Include(ri => ri.RouteStops)
            .Where(ri => ri.UserId == userId)
            .OrderByDescending(ri => ri.UpdatedAt)
            .Select(ri => new RouteItineraryDto
            {
                Id = ri.Id,
                Name = ri.Name,
                UserId = ri.UserId,
                UserDisplayName = ri.User.DisplayName,
                StartLatitude = ri.StartLatitude,
                StartLongitude = ri.StartLongitude,
                EndLatitude = ri.EndLatitude,
                EndLongitude = ri.EndLongitude,
                IsOptimized = ri.IsOptimized,
                StopCount = ri.RouteStops.Count,
                CreatedAt = ri.CreatedAt,
                UpdatedAt = ri.UpdatedAt
            })
            .ToListAsync();

        return Ok(routes);
    }

    /// <summary>
    /// Get a specific route by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<RouteItineraryDto>> GetRoute(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries
            .Include(ri => ri.User)
            .Include(ri => ri.RouteStops)
            .FirstOrDefaultAsync(ri => ri.Id == id);

        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        return Ok(new RouteItineraryDto
        {
            Id = route.Id,
            Name = route.Name,
            UserId = route.UserId,
            UserDisplayName = route.User.DisplayName,
            StartLatitude = route.StartLatitude,
            StartLongitude = route.StartLongitude,
            EndLatitude = route.EndLatitude,
            EndLongitude = route.EndLongitude,
            IsOptimized = route.IsOptimized,
            StopCount = route.RouteStops.Count,
            CreatedAt = route.CreatedAt,
            UpdatedAt = route.UpdatedAt
        });
    }

    /// <summary>
    /// Get stops for a route
    /// </summary>
    [HttpGet("{id}/stops")]
    public async Task<ActionResult<IEnumerable<RouteStopDto>>> GetRouteStops(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries.FindAsync(id);
        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        var stops = await _context.RouteStops
            .Include(rs => rs.Restaurant)
            .Where(rs => rs.RouteItineraryId == id)
            .OrderBy(rs => rs.Order)
            .Select(rs => new RouteStopDto
            {
                Id = rs.Id,
                Order = rs.Order,
                Notes = rs.Notes,
                Restaurant = rs.Restaurant
            })
            .ToListAsync();

        return Ok(stops);
    }

    /// <summary>
    /// Create a new route
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<RouteItineraryDto>> CreateRoute(CreateRouteDto createDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var route = new RouteItinerary
        {
            Name = createDto.Name,
            UserId = userId,
            StartLatitude = createDto.StartLatitude,
            StartLongitude = createDto.StartLongitude,
            EndLatitude = createDto.EndLatitude,
            EndLongitude = createDto.EndLongitude,
            IsOptimized = false
        };

        _context.RouteItineraries.Add(route);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRoute), new { id = route.Id }, new RouteItineraryDto
        {
            Id = route.Id,
            Name = route.Name,
            UserId = route.UserId,
            UserDisplayName = user.DisplayName,
            StartLatitude = route.StartLatitude,
            StartLongitude = route.StartLongitude,
            EndLatitude = route.EndLatitude,
            EndLongitude = route.EndLongitude,
            IsOptimized = route.IsOptimized,
            StopCount = 0,
            CreatedAt = route.CreatedAt,
            UpdatedAt = route.UpdatedAt
        });
    }

    /// <summary>
    /// Update a route
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoute(int id, CreateRouteDto updateDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries.FindAsync(id);
        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        route.Name = updateDto.Name;
        route.StartLatitude = updateDto.StartLatitude;
        route.StartLongitude = updateDto.StartLongitude;
        route.EndLatitude = updateDto.EndLatitude;
        route.EndLongitude = updateDto.EndLongitude;
        route.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a route
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoute(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries.FindAsync(id);
        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        _context.RouteItineraries.Remove(route);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Add a stop to a route
    /// </summary>
    [HttpPost("{id}/stops")]
    public async Task<ActionResult<RouteStopDto>> AddStop(int id, AddStopDto addDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries
            .Include(ri => ri.RouteStops)
            .FirstOrDefaultAsync(ri => ri.Id == id);

        if (route == null) return NotFound(new { message = "Route not found" });

        if (route.UserId != userId) return Forbid();

        // Check if restaurant exists
        var restaurant = await _context.Restaurants.FindAsync(addDto.RestaurantId);
        if (restaurant == null) return NotFound(new { message = "Restaurant not found" });

        // Check if already in route
        var exists = await _context.RouteStops
            .AnyAsync(rs => rs.RouteItineraryId == id && rs.RestaurantId == addDto.RestaurantId);

        if (exists)
        {
            return BadRequest(new { message = "Restaurant is already in this route" });
        }

        // Determine order
        int order = addDto.Order ?? (route.RouteStops.Any() ? route.RouteStops.Max(rs => rs.Order) + 1 : 1);

        var stop = new RouteStop
        {
            RouteItineraryId = id,
            RestaurantId = addDto.RestaurantId,
            Order = order,
            Notes = addDto.Notes
        };

        _context.RouteStops.Add(stop);
        route.UpdatedAt = DateTime.UtcNow;
        route.IsOptimized = false; // Mark as not optimized when adding stops
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetRouteStops), new { id }, new RouteStopDto
        {
            Id = stop.Id,
            Order = stop.Order,
            Notes = stop.Notes,
            Restaurant = restaurant
        });
    }

    /// <summary>
    /// Remove a stop from a route
    /// </summary>
    [HttpDelete("{routeId}/stops/{stopId}")]
    public async Task<IActionResult> RemoveStop(int routeId, int stopId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries.FindAsync(routeId);
        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        var stop = await _context.RouteStops
            .FirstOrDefaultAsync(rs => rs.Id == stopId && rs.RouteItineraryId == routeId);

        if (stop == null) return NotFound();

        _context.RouteStops.Remove(stop);
        route.UpdatedAt = DateTime.UtcNow;
        route.IsOptimized = false;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Optimize route order using nearest neighbor algorithm
    /// </summary>
    [HttpPost("{id}/optimize")]
    public async Task<ActionResult<IEnumerable<RouteStopDto>>> OptimizeRoute(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries
            .Include(ri => ri.RouteStops)
                .ThenInclude(rs => rs.Restaurant)
            .FirstOrDefaultAsync(ri => ri.Id == id);

        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        if (route.RouteStops.Count < 2)
        {
            return BadRequest(new { message = "Route must have at least 2 stops to optimize" });
        }

        // Simple nearest neighbor algorithm
        var stops = route.RouteStops.ToList();
        var optimizedStops = new List<RouteStop>();

        // Start from start point or first stop
        double currentLat = route.StartLatitude ?? stops[0].Restaurant.Latitude;
        double currentLon = route.StartLongitude ?? stops[0].Restaurant.Longitude;

        var remainingStops = new List<RouteStop>(stops);

        while (remainingStops.Any())
        {
            // Find nearest unvisited stop
            var nearest = remainingStops
                .Select(s => new
                {
                    Stop = s,
                    Distance = CalculateDistance(currentLat, currentLon, s.Restaurant.Latitude, s.Restaurant.Longitude)
                })
                .OrderBy(x => x.Distance)
                .First();

            optimizedStops.Add(nearest.Stop);
            remainingStops.Remove(nearest.Stop);

            currentLat = nearest.Stop.Restaurant.Latitude;
            currentLon = nearest.Stop.Restaurant.Longitude;
        }

        // Update order
        for (int i = 0; i < optimizedStops.Count; i++)
        {
            optimizedStops[i].Order = i + 1;
        }

        route.IsOptimized = true;
        route.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(optimizedStops.Select(s => new RouteStopDto
        {
            Id = s.Id,
            Order = s.Order,
            Notes = s.Notes,
            Restaurant = s.Restaurant
        }));
    }

    /// <summary>
    /// Reorder stops manually
    /// </summary>
    [HttpPut("{id}/reorder")]
    public async Task<IActionResult> ReorderStops(int id, [FromBody] Dictionary<int, int> stopOrders)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var route = await _context.RouteItineraries.FindAsync(id);
        if (route == null) return NotFound();

        if (route.UserId != userId) return Forbid();

        foreach (var kvp in stopOrders)
        {
            var stop = await _context.RouteStops
                .FirstOrDefaultAsync(rs => rs.Id == kvp.Key && rs.RouteItineraryId == id);

            if (stop != null)
            {
                stop.Order = kvp.Value;
            }
        }

        route.IsOptimized = false;
        route.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

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
}
