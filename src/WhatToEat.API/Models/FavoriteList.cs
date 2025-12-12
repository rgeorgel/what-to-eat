namespace WhatToEat.API.Models;

public class FavoriteList
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = false;
    public string? ShareUrl { get; set; } // Unique URL for sharing
    public ListType ListType { get; set; } = ListType.Favorites;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    public ICollection<ListItem> ListItems { get; set; } = new List<ListItem>();
    public ICollection<ListFollower> Followers { get; set; } = new List<ListFollower>();
    public ICollection<ListTag> ListTags { get; set; } = new List<ListTag>();
}
