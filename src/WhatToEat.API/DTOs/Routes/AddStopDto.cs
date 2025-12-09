using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.Routes;

public class AddStopDto
{
    [Required]
    public int RestaurantId { get; set; }

    public int? Order { get; set; }

    public string? Notes { get; set; }
}
