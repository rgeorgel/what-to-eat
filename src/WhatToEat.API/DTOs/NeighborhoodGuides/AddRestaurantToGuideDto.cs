using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.NeighborhoodGuides;

public class AddRestaurantToGuideDto
{
    [Required]
    public int RestaurantId { get; set; }

    [Required]
    public int Order { get; set; }

    public string? Description { get; set; }
}
