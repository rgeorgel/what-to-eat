namespace WhatToEat.API.Settings;

public class YelpApiSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string BaseUrl { get; set; } = "https://api.yelp.com/v3/";
    public int DefaultLimit { get; set; } = 50;
    public int DefaultRadius { get; set; } = 10000; // 10km in meters
}
