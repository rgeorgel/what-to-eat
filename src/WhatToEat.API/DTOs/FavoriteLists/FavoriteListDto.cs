using WhatToEat.API.Models;
using WhatToEat.API.DTOs.Tags;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class FavoriteListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public string? ShareUrl { get; set; }
    public ListType ListType { get; set; }
    public int ItemCount { get; set; }
    public int FollowerCount { get; set; }
    public bool IsFollowing { get; set; } = false;
    public List<TagDto> Tags { get; set; } = new List<TagDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
