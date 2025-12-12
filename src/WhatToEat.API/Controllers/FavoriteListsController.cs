using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.DTOs.FavoriteLists;
using WhatToEat.API.DTOs.Tags;
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
            .Include(fl => fl.ListTags)
                .ThenInclude(lt => lt.Tag)
            .Where(fl => fl.UserId == userId)
            .Select(fl => new FavoriteListDto
            {
                Id = fl.Id,
                Name = fl.Name,
                UserId = fl.UserId,
                UserDisplayName = fl.User.DisplayName,
                IsPublic = fl.IsPublic,
                ShareUrl = fl.ShareUrl,
                ListType = fl.ListType,
                ItemCount = fl.ListItems.Count,
                FollowerCount = fl.Followers.Count,
                IsFollowing = false,
                Tags = fl.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
                CreatedAt = fl.CreatedAt,
                UpdatedAt = fl.UpdatedAt
            })
            .ToListAsync();

        return Ok(lists);
    }

    // GET: api/favoritelists/{id} - Get list by ID
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<FavoriteListDto>> GetList(int id)
    {
        var userId = _userManager.GetUserId(User);

        var list = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .Include(fl => fl.ListTags)
                .ThenInclude(lt => lt.Tag)
            .FirstOrDefaultAsync(fl => fl.Id == id);

        if (list == null) return NotFound();

        // Only allow access if user owns the list or it's public
        // Anonymous users can only view public lists
        if (userId == null && !list.IsPublic)
        {
            return Unauthorized();
        }

        if (userId != null && list.UserId != userId && !list.IsPublic)
        {
            return Forbid();
        }

        var isFollowing = userId != null && await _context.ListFollowers
            .AnyAsync(lf => lf.FavoriteListId == id && lf.UserId == userId);

        return Ok(new FavoriteListDto
        {
            Id = list.Id,
            Name = list.Name,
            UserId = list.UserId,
            UserDisplayName = list.User.DisplayName,
            IsPublic = list.IsPublic,
            ShareUrl = list.ShareUrl,
            ListType = list.ListType,
            ItemCount = list.ListItems.Count,
            FollowerCount = list.Followers.Count,
            IsFollowing = isFollowing,
            Tags = list.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
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
            .Include(fl => fl.ListTags)
                .ThenInclude(lt => lt.Tag)
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
            ListType = list.ListType,
            ItemCount = list.ListItems.Count,
            FollowerCount = list.Followers.Count,
            IsFollowing = isFollowing,
            Tags = list.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
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
            ShareUrl = createDto.IsPublic ? GenerateShareUrl() : null,
            ListType = createDto.ListType
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
            ListType = list.ListType,
            ItemCount = 0,
            FollowerCount = 0,
            IsFollowing = false,
            Tags = new List<TagDto>(),
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
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<ListItemDto>>> GetListItems(int id)
    {
        var userId = _userManager.GetUserId(User);

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound();

        // Only allow access if user owns the list or it's public
        // Anonymous users can only view public lists
        if (userId == null && !list.IsPublic)
        {
            return Unauthorized();
        }

        if (userId != null && list.UserId != userId && !list.IsPublic)
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
            .Include(lf => lf.FavoriteList)
                .ThenInclude(fl => fl.ListTags)
                    .ThenInclude(lt => lt.Tag)
            .Where(lf => lf.UserId == userId)
            .Select(lf => new FavoriteListDto
            {
                Id = lf.FavoriteList.Id,
                Name = lf.FavoriteList.Name,
                UserId = lf.FavoriteList.UserId,
                UserDisplayName = lf.FavoriteList.User.DisplayName,
                IsPublic = lf.FavoriteList.IsPublic,
                ShareUrl = lf.FavoriteList.ShareUrl,
                ListType = lf.FavoriteList.ListType,
                ItemCount = lf.FavoriteList.ListItems.Count,
                FollowerCount = lf.FavoriteList.Followers.Count,
                IsFollowing = true,
                Tags = lf.FavoriteList.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
                CreatedAt = lf.FavoriteList.CreatedAt,
                UpdatedAt = lf.FavoriteList.UpdatedAt
            })
            .ToListAsync();

        return Ok(lists);
    }

    // GET: api/favoritelists/public - Get all public lists for discovery
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<FavoriteListDto>>> GetPublicLists(
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] string? tags = null)
    {
        var userId = _userManager.GetUserId(User);

        // Get all public lists with their relationships
        var query = _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .Include(fl => fl.ListTags)
                .ThenInclude(lt => lt.Tag)
            .Where(fl => fl.IsPublic);

        // Apply filtering by list name
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(fl => fl.Name.Contains(searchTerm));
        }

        // Apply filtering by tags (comma-separated list of tag names)
        if (!string.IsNullOrWhiteSpace(tags))
        {
            var tagNames = tags.Split(',').Select(t => t.Trim().TrimStart('#').ToLower()).ToList();
            query = query.Where(fl => fl.ListTags.Any(lt => tagNames.Contains(lt.Tag.Name)));
        }

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "oldest" => query.OrderBy(fl => fl.CreatedAt),
            "followers" => query.OrderByDescending(fl => fl.Followers.Count).ThenByDescending(fl => fl.UpdatedAt),
            _ => query.OrderByDescending(fl => fl.Followers.Count).ThenByDescending(fl => fl.UpdatedAt) // Default sorting
        };

        var publicLists = await query.ToListAsync();

        // Get list of IDs that the current user is following (if authenticated)
        var followingListIds = new List<int>();
        if (userId != null)
        {
            followingListIds = await _context.ListFollowers
                .Where(lf => lf.UserId == userId)
                .Select(lf => lf.FavoriteListId)
                .ToListAsync();
        }

        var result = publicLists.Select(fl => new FavoriteListDto
        {
            Id = fl.Id,
            Name = fl.Name,
            UserId = fl.UserId,
            UserDisplayName = fl.User.DisplayName,
            IsPublic = fl.IsPublic,
            ShareUrl = fl.ShareUrl,
            ListType = fl.ListType,
            ItemCount = fl.ListItems.Count,
            FollowerCount = fl.Followers.Count,
            IsFollowing = followingListIds.Contains(fl.Id),
            Tags = fl.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
            CreatedAt = fl.CreatedAt,
            UpdatedAt = fl.UpdatedAt
        }).ToList();

        return Ok(result);
    }

    // GET: api/favoritelists/by-type/{listType} - Get lists by type (e.g., Watchlist, Favorites)
    [HttpGet("by-type/{listType}")]
    public async Task<ActionResult<IEnumerable<FavoriteListDto>>> GetListsByType(ListType listType)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var lists = await _context.FavoriteLists
            .Include(fl => fl.User)
            .Include(fl => fl.ListItems)
            .Include(fl => fl.Followers)
            .Include(fl => fl.ListTags)
                .ThenInclude(lt => lt.Tag)
            .Where(fl => fl.UserId == userId && fl.ListType == listType)
            .Select(fl => new FavoriteListDto
            {
                Id = fl.Id,
                Name = fl.Name,
                UserId = fl.UserId,
                UserDisplayName = fl.User.DisplayName,
                IsPublic = fl.IsPublic,
                ShareUrl = fl.ShareUrl,
                ListType = fl.ListType,
                ItemCount = fl.ListItems.Count,
                FollowerCount = fl.Followers.Count,
                IsFollowing = false,
                Tags = fl.ListTags.Select(lt => new TagDto { Id = lt.Tag.Id, Name = lt.Tag.Name }).ToList(),
                CreatedAt = fl.CreatedAt,
                UpdatedAt = fl.UpdatedAt
            })
            .ToListAsync();

        return Ok(lists);
    }

    // POST: api/favoritelists/{listId}/change-type - Change list type (e.g., from Watchlist to Favorites)
    [HttpPost("{listId}/change-type")]
    public async Task<IActionResult> ChangeListType(int listId, [FromQuery] ListType newType)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(listId);
        if (list == null) return NotFound();

        if (list.UserId != userId) return Forbid();

        list.ListType = newType;
        list.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "List type updated successfully", listType = newType });
    }

    // POST: api/favoritelists/{id}/tags - Add tag to list
    [HttpPost("{id}/tags")]
    public async Task<ActionResult<TagDto>> AddTagToList(int id, AddTagDto addTagDto)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound(new { message = "List not found" });

        if (list.UserId != userId) return Forbid();

        // Normalize tag name (remove # if present, convert to lowercase)
        var tagName = addTagDto.Name.TrimStart('#').ToLower();

        // Find or create tag
        var tag = await _context.Tags.FirstOrDefaultAsync(t => t.Name == tagName);
        if (tag == null)
        {
            tag = new Tag { Name = tagName };
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
        }

        // Check if tag is already added to the list
        var existingListTag = await _context.ListTags
            .FirstOrDefaultAsync(lt => lt.FavoriteListId == id && lt.TagId == tag.Id);

        if (existingListTag != null)
        {
            return BadRequest(new { message = "Tag already exists on this list" });
        }

        var listTag = new ListTag
        {
            FavoriteListId = id,
            TagId = tag.Id
        };

        _context.ListTags.Add(listTag);
        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new TagDto { Id = tag.Id, Name = tag.Name });
    }

    // DELETE: api/favoritelists/{id}/tags/{tagId} - Remove tag from list
    [HttpDelete("{id}/tags/{tagId}")]
    public async Task<IActionResult> RemoveTagFromList(int id, int tagId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId == null) return Unauthorized();

        var list = await _context.FavoriteLists.FindAsync(id);
        if (list == null) return NotFound(new { message = "List not found" });

        if (list.UserId != userId) return Forbid();

        var listTag = await _context.ListTags
            .FirstOrDefaultAsync(lt => lt.FavoriteListId == id && lt.TagId == tagId);

        if (listTag == null) return NotFound(new { message = "Tag not found on this list" });

        _context.ListTags.Remove(listTag);
        list.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/favoritelists/tags/popular - Get popular tags
    [HttpGet("tags/popular")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<object>>> GetPopularTags([FromQuery] int limit = 20)
    {
        var popularTags = await _context.ListTags
            .GroupBy(lt => lt.Tag)
            .Select(g => new
            {
                Tag = new TagDto { Id = g.Key.Id, Name = g.Key.Name },
                Count = g.Count()
            })
            .OrderByDescending(x => x.Count)
            .Take(limit)
            .ToListAsync();

        return Ok(popularTags);
    }

    private string GenerateShareUrl()
    {
        return Guid.NewGuid().ToString("N")[..12]; // 12 character unique ID
    }
}
