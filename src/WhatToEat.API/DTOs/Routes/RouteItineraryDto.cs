using WhatToEat.API.Models;

namespace WhatToEat.API.DTOs.Routes;

public class RouteItineraryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserDisplayName { get; set; } = string.Empty;
    public double? StartLatitude { get; set; }
    public double? StartLongitude { get; set; }
    public double? EndLatitude { get; set; }
    public double? EndLongitude { get; set; }
    public bool IsOptimized { get; set; }
    public int StopCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
