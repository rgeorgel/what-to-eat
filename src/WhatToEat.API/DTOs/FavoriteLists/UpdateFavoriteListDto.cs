using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class UpdateFavoriteListDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    public bool? IsPublic { get; set; }
}
