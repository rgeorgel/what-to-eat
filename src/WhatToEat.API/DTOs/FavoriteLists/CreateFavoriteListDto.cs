using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class CreateFavoriteListDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    public bool IsPublic { get; set; } = false;
}
