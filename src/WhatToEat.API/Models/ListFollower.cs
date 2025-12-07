namespace WhatToEat.API.Models;

public class ListFollower
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public int FavoriteListId { get; set; }
    public DateTime FollowedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public FavoriteList FavoriteList { get; set; } = null!;
}
