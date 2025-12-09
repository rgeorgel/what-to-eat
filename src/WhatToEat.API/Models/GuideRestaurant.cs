namespace WhatToEat.API.Models;

public class GuideRestaurant
{
    public int Id { get; set; }
    public int NeighborhoodGuideId { get; set; }
    public int RestaurantId { get; set; }
    public int Order { get; set; } // Display order in the guide
    public string? Description { get; set; } // Optional description for this restaurant in the guide
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public NeighborhoodGuide NeighborhoodGuide { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
}
