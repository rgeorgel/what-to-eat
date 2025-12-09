namespace WhatToEat.API.Models;

public class RouteStop
{
    public int Id { get; set; }
    public int RouteItineraryId { get; set; }
    public int RestaurantId { get; set; }
    public int Order { get; set; } // Stop order in the route
    public string? Notes { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public RouteItinerary RouteItinerary { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
}
