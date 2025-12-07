using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class AddRestaurantDto
{
    [Required]
    public int RestaurantId { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
