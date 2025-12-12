using WhatToEat.API.DTOs.Tags;

namespace WhatToEat.API.DTOs.NeighborhoodGuides;

public class NeighborhoodGuideDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string NeighborhoodName { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public bool IsOfficial { get; set; }
    public string? ImageUrl { get; set; }
    public int RestaurantCount { get; set; }
    public List<TagDto> Tags { get; set; } = new List<TagDto>();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
