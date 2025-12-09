using System.ComponentModel.DataAnnotations;
using WhatToEat.API.Models;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class CreateFavoriteListDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    public bool IsPublic { get; set; } = false;

    public ListType ListType { get; set; } = ListType.Favorites;
}
