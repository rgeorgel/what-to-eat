using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.Routes;

public class CreateRouteDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    public double? StartLatitude { get; set; }
    public double? StartLongitude { get; set; }
    public double? EndLatitude { get; set; }
    public double? EndLongitude { get; set; }
}
