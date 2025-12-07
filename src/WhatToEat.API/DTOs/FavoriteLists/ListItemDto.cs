using WhatToEat.API.Models;

namespace WhatToEat.API.DTOs.FavoriteLists;

public class ListItemDto
{
    public int Id { get; set; }
    public Restaurant Restaurant { get; set; } = null!;
    public string? Notes { get; set; }
    public DateTime AddedAt { get; set; }
}
