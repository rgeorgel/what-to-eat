using WhatToEat.API.Models;

namespace WhatToEat.API.DTOs.Routes;

public class RouteStopDto
{
    public int Id { get; set; }
    public int Order { get; set; }
    public string? Notes { get; set; }
    public Restaurant Restaurant { get; set; } = null!;
}
