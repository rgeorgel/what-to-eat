using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.DTOs.NeighborhoodGuides;
using WhatToEat.API.Models;

namespace WhatToEat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NeighborhoodGuidesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public NeighborhoodGuidesController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    /// <summary>
    /// Get all neighborhood guides with optional filtering
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<NeighborhoodGuideDto>>> GetGuides(
        [FromQuery] string? neighborhood = null,
        [FromQuery] bool? officialOnly = null)
    {
        var query = _context.NeighborhoodGuides
            .Include(ng => ng.User)
            .Include(ng => ng.GuideRestaurants)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(neighborhood))
        {
            query = query.Where(ng => ng.NeighborhoodName.ToLower().Contains(neighborhood.ToLower()));
        }

        if (officialOnly.HasValue && officialOnly.Value)
        {
            query = query.Where(ng => ng.IsOfficial);
        }

        var guides = await query
            .OrderByDescending(ng => ng.IsOfficial)
            .ThenByDescending(ng => ng.CreatedAt)
            .Select(ng => new NeighborhoodGuideDto
            {
                Id = ng.Id,
                Title = ng.Title,
                Description = ng.Description,
                NeighborhoodName = ng.NeighborhoodName,
                UserId = ng.UserId,
                UserDisplayName = ng.User.DisplayName,
                IsOfficial = ng.IsOfficial,
                ImageUrl = ng.ImageUrl,
                RestaurantCount = ng.GuideRestaurants.Count,
                CreatedAt = ng.CreatedAt,
                UpdatedAt = ng.UpdatedAt
            })
            .ToListAsync();

        return Ok(guides);
    }

    /// <summary>
    /// Get a specific neighborhood guide by ID
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<NeighborhoodGuideDto>> GetGuide(int id)
    {
        var guide = await _context.NeighborhoodGuides
            .Include(ng => ng.User)
            .Include(ng => ng.GuideRestaurants)
            .FirstOrDefaultAsync(ng => ng.Id == id);

        if (guide == null) return NotFound();

        return Ok(new NeighborhoodGuideDto
        {
            Id = guide.Id,
            Title = guide.Title,
            Description = guide.Description,
            NeighborhoodName = guide.NeighborhoodName,
            UserId = guide.UserId,
            UserDisplayName = guide.User.DisplayName,
            IsOfficial = guide.IsOfficial,
            ImageUrl = guide.ImageUrl,
            RestaurantCount = guide.GuideRestaurants.Count,
            CreatedAt = guide.CreatedAt,
            UpdatedAt = guide.UpdatedAt
        });
    }

    /// <summary>
    /// Get restaurants in a guide
    /// </summary>
    [HttpGet("{id}/restaurants")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<GuideRestaurantDto>>> GetGuideRestaurants(int id)
    {
        var guideExists = await _context.NeighborhoodGuides.AnyAsync(ng => ng.Id == id);
        if (!guideExists) return NotFound();

        var restaurants = await _context.GuideRestaurants
            .Include(gr => gr.Restaurant)
            .Where(gr => gr.NeighborhoodGuideId == id)
            .OrderBy(gr => gr.Order)
            .Select(gr => new GuideRestaurantDto
            {
                Id = gr.Id,
                Order = gr.Order,
                Description = gr.Description,
                Restaurant = gr.Restaurant
            })
            .ToListAsync();

        return Ok(restaurants);
    }

    /// <summary>
    /// Create a new neighborhood guide
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<NeighborhoodGuideDto>> CreateGuide(CreateNeighborhoodGuideDto createDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var guide = new NeighborhoodGuide
        {
            Title = createDto.Title,
            Description = createDto.Description,
            NeighborhoodName = createDto.NeighborhoodName,
            UserId = userId,
            ImageUrl = createDto.ImageUrl,
            IsOfficial = false // Users cannot create official guides
        };

        _context.NeighborhoodGuides.Add(guide);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGuide), new { id = guide.Id }, new NeighborhoodGuideDto
        {
            Id = guide.Id,
            Title = guide.Title,
            Description = guide.Description,
            NeighborhoodName = guide.NeighborhoodName,
            UserId = guide.UserId,
            UserDisplayName = user.DisplayName,
            IsOfficial = guide.IsOfficial,
            ImageUrl = guide.ImageUrl,
            RestaurantCount = 0,
            CreatedAt = guide.CreatedAt,
            UpdatedAt = guide.UpdatedAt
        });
    }

    /// <summary>
    /// Update a neighborhood guide
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateGuide(int id, CreateNeighborhoodGuideDto updateDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var guide = await _context.NeighborhoodGuides.FindAsync(id);
        if (guide == null) return NotFound();

        if (guide.UserId != userId) return Forbid();

        guide.Title = updateDto.Title;
        guide.Description = updateDto.Description;
        guide.NeighborhoodName = updateDto.NeighborhoodName;
        guide.ImageUrl = updateDto.ImageUrl;
        guide.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Delete a neighborhood guide
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteGuide(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var guide = await _context.NeighborhoodGuides.FindAsync(id);
        if (guide == null) return NotFound();

        if (guide.UserId != userId) return Forbid();

        _context.NeighborhoodGuides.Remove(guide);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Add a restaurant to a guide
    /// </summary>
    [HttpPost("{id}/restaurants")]
    [Authorize]
    public async Task<ActionResult<GuideRestaurantDto>> AddRestaurantToGuide(int id, AddRestaurantToGuideDto addDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var guide = await _context.NeighborhoodGuides.FindAsync(id);
        if (guide == null) return NotFound(new { message = "Guide not found" });

        if (guide.UserId != userId) return Forbid();

        // Check if restaurant exists
        var restaurant = await _context.Restaurants.FindAsync(addDto.RestaurantId);
        if (restaurant == null) return NotFound(new { message = "Restaurant not found" });

        // Check if already in guide
        var exists = await _context.GuideRestaurants
            .AnyAsync(gr => gr.NeighborhoodGuideId == id && gr.RestaurantId == addDto.RestaurantId);

        if (exists)
        {
            return BadRequest(new { message = "Restaurant is already in this guide" });
        }

        var guideRestaurant = new GuideRestaurant
        {
            NeighborhoodGuideId = id,
            RestaurantId = addDto.RestaurantId,
            Order = addDto.Order,
            Description = addDto.Description
        };

        _context.GuideRestaurants.Add(guideRestaurant);
        guide.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetGuideRestaurants), new { id }, new GuideRestaurantDto
        {
            Id = guideRestaurant.Id,
            Order = guideRestaurant.Order,
            Description = guideRestaurant.Description,
            Restaurant = restaurant
        });
    }

    /// <summary>
    /// Remove a restaurant from a guide
    /// </summary>
    [HttpDelete("{guideId}/restaurants/{restaurantId}")]
    [Authorize]
    public async Task<IActionResult> RemoveRestaurantFromGuide(int guideId, int restaurantId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var guide = await _context.NeighborhoodGuides.FindAsync(guideId);
        if (guide == null) return NotFound();

        if (guide.UserId != userId) return Forbid();

        var guideRestaurant = await _context.GuideRestaurants
            .FirstOrDefaultAsync(gr => gr.NeighborhoodGuideId == guideId && gr.RestaurantId == restaurantId);

        if (guideRestaurant == null) return NotFound();

        _context.GuideRestaurants.Remove(guideRestaurant);
        guide.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Get unique neighborhood names
    /// </summary>
    [HttpGet("neighborhoods")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<string>>> GetNeighborhoods()
    {
        var neighborhoods = await _context.NeighborhoodGuides
            .Select(ng => ng.NeighborhoodName)
            .Distinct()
            .OrderBy(n => n)
            .ToListAsync();

        return Ok(neighborhoods);
    }
}
