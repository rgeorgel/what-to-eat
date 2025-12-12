using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.DTOs.Tags;

public class AddTagDto
{
    [Required]
    [MaxLength(50)]
    [RegularExpression(@"^[a-zA-Z0-9_]+$", ErrorMessage = "Tag must contain only letters, numbers, and underscores")]
    public string Name { get; set; } = string.Empty;
}
