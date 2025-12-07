namespace WhatToEat.API.Models;

public class ListItem
{
    public int Id { get; set; }
    public int FavoriteListId { get; set; }
    public int RestaurantId { get; set; }
    public string? Notes { get; set; } // Optional notes about why this restaurant is in the list
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public FavoriteList FavoriteList { get; set; } = null!;
    public Restaurant Restaurant { get; set; } = null!;
}
