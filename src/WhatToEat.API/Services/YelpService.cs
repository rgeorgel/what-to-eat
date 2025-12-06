using Microsoft.Extensions.Options;
using System.Text.Json;
using WhatToEat.API.DTOs.Yelp;
using WhatToEat.API.Models;
using WhatToEat.API.Settings;

namespace WhatToEat.API.Services;

public interface IYelpService
{
    Task<List<Restaurant>> SearchRestaurantsAsync(string location, int limit = 50, int offset = 0);
    Task<List<Restaurant>> SearchRestaurantsByCoordinatesAsync(double latitude, double longitude, int radius = 10000, int limit = 50, int offset = 0);
}

public class YelpService : IYelpService
{
    private readonly HttpClient _httpClient;
    private readonly YelpApiSettings _settings;
    private readonly ILogger<YelpService> _logger;

    public YelpService(
        HttpClient httpClient,
        IOptions<YelpApiSettings> settings,
        ILogger<YelpService> logger)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_settings.ApiKey}");
    }

    public async Task<List<Restaurant>> SearchRestaurantsAsync(string location, int limit = 50, int offset = 0)
    {
        try
        {
            var queryParams = new Dictionary<string, string>
            {
                { "location", location },
                { "categories", "restaurants" },
                { "limit", Math.Min(limit, 50).ToString() },
                { "offset", offset.ToString() }
            };

            var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            var response = await _httpClient.GetAsync($"/businesses/search?{queryString}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Yelp API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                return new List<Restaurant>();
            }

            var content = await response.Content.ReadAsStringAsync();
            var yelpResponse = JsonSerializer.Deserialize<YelpSearchResponse>(content);

            if (yelpResponse?.Businesses == null)
            {
                _logger.LogWarning("No businesses found in Yelp response");
                return new List<Restaurant>();
            }

            return yelpResponse.Businesses.Select(MapToRestaurant).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching restaurants from Yelp");
            return new List<Restaurant>();
        }
    }

    public async Task<List<Restaurant>> SearchRestaurantsByCoordinatesAsync(
        double latitude,
        double longitude,
        int radius = 10000,
        int limit = 50,
        int offset = 0)
    {
        try
        {
            var queryParams = new Dictionary<string, string>
            {
                { "latitude", latitude.ToString("F6") },
                { "longitude", longitude.ToString("F6") },
                { "categories", "restaurants" },
                { "radius", Math.Min(radius, 40000).ToString() },
                { "limit", Math.Min(limit, 50).ToString() },
                { "offset", offset.ToString() }
            };

            var queryString = string.Join("&", queryParams.Select(kvp => $"{kvp.Key}={Uri.EscapeDataString(kvp.Value)}"));
            var response = await _httpClient.GetAsync($"/businesses/search?{queryString}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Yelp API error: {StatusCode} - {Content}", response.StatusCode, errorContent);
                return new List<Restaurant>();
            }

            var content = await response.Content.ReadAsStringAsync();
            var yelpResponse = JsonSerializer.Deserialize<YelpSearchResponse>(content);

            if (yelpResponse?.Businesses == null)
            {
                _logger.LogWarning("No businesses found in Yelp response");
                return new List<Restaurant>();
            }

            return yelpResponse.Businesses.Select(MapToRestaurant).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching restaurants from Yelp by coordinates");
            return new List<Restaurant>();
        }
    }

    private Restaurant MapToRestaurant(YelpBusiness business)
    {
        var category = business.Categories.FirstOrDefault()?.Title ?? "Restaurant";
        var cuisineType = business.Categories.Skip(1).FirstOrDefault()?.Title ??
                         business.Categories.FirstOrDefault()?.Title ??
                         "General";

        var fullAddress = string.Join(", ", new[]
        {
            business.Location.Address1,
            business.Location.Address2,
            business.Location.Address3,
            business.Location.City,
            business.Location.State,
            business.Location.ZipCode
        }.Where(s => !string.IsNullOrWhiteSpace(s)));

        return new Restaurant
        {
            Name = business.Name,
            Category = TruncateString(category, 100),
            CuisineType = TruncateString(cuisineType, 100),
            Address = TruncateString(fullAddress, 500),
            Latitude = business.Coordinates.Latitude,
            Longitude = business.Coordinates.Longitude,
            Phone = TruncateString(business.DisplayPhone ?? business.Phone, 20),
            Rating = business.Rating,
            ImageUrl = TruncateString(business.ImageUrl, 500),
            Description = null,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static string TruncateString(string value, int maxLength)
    {
        if (string.IsNullOrEmpty(value))
            return value;

        return value.Length <= maxLength ? value : value[..maxLength];
    }
}
