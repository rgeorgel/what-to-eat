using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.Models;

public class ListTag
{
    public int Id { get; set; }

    [Required]
    public int FavoriteListId { get; set; }

    [Required]
    public int TagId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public FavoriteList FavoriteList { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
