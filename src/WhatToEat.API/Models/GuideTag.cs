using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.Models;

public class GuideTag
{
    public int Id { get; set; }

    [Required]
    public int NeighborhoodGuideId { get; set; }

    [Required]
    public int TagId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public NeighborhoodGuide NeighborhoodGuide { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
