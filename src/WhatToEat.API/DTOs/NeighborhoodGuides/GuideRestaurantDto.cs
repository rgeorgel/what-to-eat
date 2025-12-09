using WhatToEat.API.Models;

namespace WhatToEat.API.DTOs.NeighborhoodGuides;

public class GuideRestaurantDto
{
    public int Id { get; set; }
    public int Order { get; set; }
    public string? Description { get; set; }
    public Restaurant Restaurant { get; set; } = null!;
}
