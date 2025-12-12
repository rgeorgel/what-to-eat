using System.ComponentModel.DataAnnotations;

namespace WhatToEat.API.Models;

public class Tag
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public ICollection<ListTag> ListTags { get; set; } = new List<ListTag>();
    public ICollection<GuideTag> GuideTags { get; set; } = new List<GuideTag>();
}
