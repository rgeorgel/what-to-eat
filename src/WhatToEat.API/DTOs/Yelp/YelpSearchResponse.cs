using System.Text.Json.Serialization;

namespace WhatToEat.API.DTOs.Yelp;

public class YelpSearchResponse
{
    [JsonPropertyName("businesses")]
    public List<YelpBusiness> Businesses { get; set; } = new();

    [JsonPropertyName("total")]
    public int Total { get; set; }
}

public class YelpBusiness
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;

    [JsonPropertyName("rating")]
    public decimal Rating { get; set; }

    [JsonPropertyName("coordinates")]
    public YelpCoordinates Coordinates { get; set; } = new();

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("display_phone")]
    public string DisplayPhone { get; set; } = string.Empty;

    [JsonPropertyName("location")]
    public YelpLocation Location { get; set; } = new();

    [JsonPropertyName("categories")]
    public List<YelpCategory> Categories { get; set; } = new();
}

public class YelpCoordinates
{
    [JsonPropertyName("latitude")]
    public double Latitude { get; set; }

    [JsonPropertyName("longitude")]
    public double Longitude { get; set; }
}

public class YelpLocation
{
    [JsonPropertyName("address1")]
    public string Address1 { get; set; } = string.Empty;

    [JsonPropertyName("address2")]
    public string? Address2 { get; set; }

    [JsonPropertyName("address3")]
    public string? Address3 { get; set; }

    [JsonPropertyName("city")]
    public string City { get; set; } = string.Empty;

    [JsonPropertyName("zip_code")]
    public string ZipCode { get; set; } = string.Empty;

    [JsonPropertyName("country")]
    public string Country { get; set; } = string.Empty;

    [JsonPropertyName("state")]
    public string State { get; set; } = string.Empty;

    [JsonPropertyName("display_address")]
    public List<string> DisplayAddress { get; set; } = new();
}

public class YelpCategory
{
    [JsonPropertyName("alias")]
    public string Alias { get; set; } = string.Empty;

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;
}
