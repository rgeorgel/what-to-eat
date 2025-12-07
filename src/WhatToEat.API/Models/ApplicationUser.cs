using Microsoft.AspNetCore.Identity;

namespace WhatToEat.API.Models;

public class ApplicationUser : IdentityUser
{
    public string DisplayName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<FavoriteList> FavoriteLists { get; set; } = new List<FavoriteList>();
    public ICollection<ListFollower> FollowingLists { get; set; } = new List<ListFollower>();
}
