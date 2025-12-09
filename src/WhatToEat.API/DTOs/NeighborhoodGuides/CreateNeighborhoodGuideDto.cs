using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.NeighborhoodGuides;

public class CreateNeighborhoodGuideDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(1000, MinimumLength = 1)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string NeighborhoodName { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
}
