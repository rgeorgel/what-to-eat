using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.DTOs.FavoriteLists;
using WhatToEat.API.Models;

namespace WhatToEat.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoriteListsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public FavoriteListsController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: api/favoritelists - Get current user's lists
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FavoriteListDto>>> GetMyLists()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var lists = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .Where(fl => fl.UserId == userId)
            .Select(fl => new FavoriteListDto
            {
                Id = fl.Id,
                Name = fl.Name,
                UserId = fl.UserId,
                UserDisplayName = fl.User.DisplayName,
                IsPublic = fl.IsPublic,
                ShareUrl = fl.ShareUrl,
                ItemCount = fl.ListItems.Count,
                FollowerCount = fl.Followers.Count,
                IsFollowing = false,
                CreatedAt = fl.CreatedAt,
                UpdatedAt = fl.UpdatedAt
            })
            .ToListAsync();

        return Ok(lists);
    }

    // GET: api/favoritelists/{id} - Get list by ID
    [HttpGet("{id}")]
    public async Task<ActionResult<FavoriteListDto>> GetList(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .FirstOrDefaultAsync(fl => fl.Id == id);

        if (list == null) return NotFound();

        // Only allow access if user owns the list or it's public
        if (list.UserId != userId && !list.IsPublic)
        {
            return Forbid();
        }

        var isFollowing = await _context.ListFollowers
            .AnyAsync(lf => lf.FavoriteListId == id && lf.UserId == userId);

        return Ok(new FavoriteListDto
        {
            Id = list.Id,
            Name = list.Name,
            UserId = list.UserId,
            UserDisplayName = list.User.DisplayName,
            IsPublic = list.IsPublic,
            ShareUrl = list.ShareUrl,
            ItemCount = list.ListItems.Count,
            FollowerCount = list.Followers.Count,
            IsFollowing = isFollowing,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        });
    }

    // GET: api/favoritelists/share/{shareUrl} - Get list by share URL (public)
    [HttpGet("share/{shareUrl}")]
    [AllowAnonymous]
    public async Task<ActionResult<FavoriteListDto>> GetListByShareUrl(string shareUrl)
    {
        var list = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .FirstOrDefaultAsync(fl => fl.ShareUrl == shareUrl && fl.IsPublic);

        if (list == null) return NotFound();

        var userId = _userManager.GetUserId(User);
        var isFollowing = userId != null && await _context.ListFollowers
            .AnyAsync(lf => lf.FavoriteListId == list.Id && lf.UserId == userId);

        return Ok(new FavoriteListDto
        {
            Id = list.Id,
            Name = list.Name,
            UserId = list.UserId,
            UserDisplayName = list.User.DisplayName,
            IsPublic = list.IsPublic,
            ShareUrl = list.ShareUrl,
            ItemCount = list.ListItems.Count,
            FollowerCount = list.Followers.Count,
            IsFollowing = isFollowing,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        });
    }

    // POST: api/favoritelists - Create a new list
    [HttpPost]
    public async Task<ActionResult<FavoriteListDto>> CreateList(CreateFavoriteListDto createDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        var list = new FavoriteList
        {
            Name = createDto.Name,
            UserId = userId,
            IsPublic = createDto.IsPublic,
            ShareUrl = createDto.IsPublic ? GenerateShareUrl() : null
        };

        _context.FavoriteLists.Add(list);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetList), new { id = list.Id }, new FavoriteListDto
        {
            Id = list.Id,
            Name = list.Name,
            UserId = list.UserId,
            UserDisplayName = user.DisplayName,
            IsPublic = list.IsPublic,
            ShareUrl = list.ShareUrl,
            ItemCount = 0,
            FollowerCount = 0,
            IsFollowing = false,
            CreatedAt = list.CreatedAt,
            UpdatedAt = list.UpdatedAt
        });
    }

    // PUT: api/favoritelists/{id} - Update list
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateList(int id, UpdateFavoriteListDto updateDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        if (list.UserId != userId) return Forbid();

        if (updateDto.Name != null)
        {
            list.Name = updateDto.Name;
        }

        if (updateDto.IsPublic.HasValue)
        {
            list.IsPublic = updateDto.IsPublic.Value;

            // Generate share URL if making public and doesn't have one
            if (list.IsPublic && string.IsNullOrEmpty(list.ShareUrl))
            {
                list.ShareUrl = GenerateShareUrl();
            }
            // Remove share URL if making private
            else if (!list.IsPublic)
            {
                list.ShareUrl = null;
            }
        }

        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/favoritelists/{id} - Delete list
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        if (list.UserId != userId) return Forbid();

        _context.FavoriteLists.Remove(list);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/favoritelists/{id}/items - Get items in a list
    [HttpGet("{id}/items")]
    public async Task<ActionResult<IEnumerable<ListItemDto>>> GetListItems(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        // Only allow access if user owns the list or it's public
        if (list.UserId != userId && !list.IsPublic)
        {
            return Forbid();
        }

        var items = await _context.ListItems
            .Include(li => li.Restaurant)
            .Where(li => li.FavoriteListId == id)
            .OrderByDescending(li => li.AddedAt)
            .Select(li => new ListItemDto
            {
                Id = li.Id,
                Restaurant = li.Restaurant,
                Notes = li.Notes,
                AddedAt = li.AddedAt
            })
            .ToListAsync();

        return Ok(items);
    }

    // POST: api/favoritelists/{id}/items - Add restaurant to list
    [HttpPost("{id}/items")]
    public async Task<ActionResult<ListItemDto>> AddRestaurant(int id, AddRestaurantDto addDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound(new { message = "List not found" });

        if (list.UserId != userId) return Forbid();

        var restaurant = await _context.Restaurants.FindAsync(addDto.RestaurantId);
        if (restaurant == null) return NotFound(new { message = "Restaurant not found" });

        // Check if restaurant is already in the list
        var existingItem = await _context.ListItems
            .FirstOrDefaultAsync(li => li.FavoriteListId == id && li.RestaurantId == addDto.RestaurantId);

        if (existingItem != null)
        {
            return BadRequest(new { message = "Restaurant is already in this list" });
        }

        var listItem = new ListItem
        {
            FavoriteListId = id,
            RestaurantId = addDto.RestaurantId,
            Notes = addDto.Notes
        };

        _context.ListItems.Add(listItem);
        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new ListItemDto
        {
            Id = listItem.Id,
            Restaurant = restaurant,
            Notes = listItem.Notes,
            AddedAt = listItem.AddedAt
        });
    }

    // DELETE: api/favoritelists/{id}/items/{itemId} - Remove restaurant from list
    [HttpDelete("{id}/items/{itemId}")]
    public async Task<IActionResult> RemoveRestaurant(int id, int itemId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        if (list.UserId != userId) return Forbid();

        var listItem = await _context.ListItems.FindAsync(itemId);
        if (listItem == null || listItem.FavoriteListId != id) return NotFound();

        _context.ListItems.Remove(listItem);
        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/favoritelists/{id}/follow - Follow a list
    [HttpPost("{id}/follow")]
    public async Task<IActionResult> FollowList(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        // Can't follow private lists
        if (!list.IsPublic) return BadRequest(new { message = "Cannot follow a private list" });

        // Can't follow your own list
        if (list.UserId == userId) return BadRequest(new { message = "Cannot follow your own list" });

        // Check if already following
        var existingFollow = await _context.ListFollowers
            .FirstOrDefaultAsync(lf => lf.FavoriteListId == id && lf.UserId == userId);

        if (existingFollow != null)
        {
            return BadRequest(new { message = "Already following this list" });
        }

        var follower = new ListFollower
        {
            FavoriteListId = id,
            UserId = userId
        };

        _context.ListFollowers.Add(follower);
        await _context.SaveChangesAsync();

        return Ok(new { message = "List followed successfully" });
    }

    // DELETE: api/favoritelists/{id}/follow - Unfollow a list
    [HttpDelete("{id}/follow")]
    public async Task<IActionResult> UnfollowList(int id)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var follower = await _context.ListFollowers
            .FirstOrDefaultAsync(lf => lf.FavoriteListId == id && lf.UserId == userId);

        if (follower == null) return NotFound(new { message = "Not following this list" });

        _context.ListFollowers.Remove(follower);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/favoritelists/following - Get lists the user is following
    [HttpGet("following")]
    public async Task<ActionResult<IEnumerable<FavoriteListDto>>> GetFollowingLists()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var lists = await _context.ListFollowers
            .Include(lf => lf.FavoriteList)
                .ThenInclude(fl => fl.User)
            .Include(lf => lf.FavoriteList)
                .ThenInclude(fl => fl.ListItems)
            .Include(lf => lf.FavoriteList)
                .ThenInclude(fl => fl.Followers)
            .Where(lf => lf.UserId == userId)
            .Select(lf => new FavoriteListDto
            {
                Id = lf.FavoriteList.Id,
                Name = lf.FavoriteList.Name,
                UserId = lf.FavoriteList.UserId,
                UserDisplayName = lf.FavoriteList.User.DisplayName,
                IsPublic = lf.FavoriteList.IsPublic,
                ShareUrl = lf.FavoriteList.ShareUrl,
                ItemCount = lf.FavoriteList.ListItems.Count,
                FollowerCount = lf.FavoriteList.Followers.Count,
                IsFollowing = true,
                CreatedAt = lf.FavoriteList.CreatedAt,
                UpdatedAt = lf.FavoriteList.UpdatedAt
            })
            .ToListAsync();

        return Ok(lists);
    }

    // GET: api/favoritelists/public - Get all public lists for discovery
    [HttpGet("public")]
    public async Task<ActionResult<IEnumerable<FavoriteListDto>>> GetPublicLists()
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        // Get all public lists with their relationships
        var publicLists = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .Where(fl => fl.IsPublic)
            .OrderByDescending(fl => fl.Followers.Count)
            .ThenByDescending(fl => fl.UpdatedAt)
            .ToListAsync();

        // Get list of IDs that the current user is following
        var followingListIds = await _context.ListFollowers
            .Where(lf => lf.UserId == userId)
            .Select(lf => lf.FavoriteListId)
            .ToListAsync();

        var result = publicLists.Select(fl => new FavoriteListDto
        {
            Id = fl.Id,
            Name = fl.Name,
            UserId = fl.UserId,
            UserDisplayName = fl.User.DisplayName,
            IsPublic = fl.IsPublic,
            ShareUrl = fl.ShareUrl,
            ItemCount = fl.ListItems.Count,
            FollowerCount = fl.Followers.Count,
            IsFollowing = followingListIds.Contains(fl.Id),
            CreatedAt = fl.CreatedAt,
            UpdatedAt = fl.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    private string GenerateShareUrl()
    {
        return Guid.NewGuid().ToString("N")[..12]; // 12 character unique ID
    }
}
