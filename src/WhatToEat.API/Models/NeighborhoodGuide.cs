namespace WhatToEat.API.Models;

public class NeighborhoodGuide
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string NeighborhoodName { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsOfficial { get; set; } = false; // Curated by admin
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<GuideRestaurant> GuideRestaurants { get; set; } = new List<GuideRestaurant>();
    public ICollection<GuideTag> GuideTags { get; set; } = new List<GuideTag>();
}
