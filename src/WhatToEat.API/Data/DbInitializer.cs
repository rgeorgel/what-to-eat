using WhatToEat.API.Models;

namespace WhatToEat.API.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Check if database is already seeded
        // Use try-catch in case table doesn't exist yet
        try
        {
            if (context.Restaurants.Any())
            {
                return;
            }
        }
        catch
        {
            // Table doesn't exist, will be created by EnsureCreated in Program.cs
        }

        var restaurants = new Restaurant[]
        {
            // Pizza restaurants - Toronto
            new Restaurant
            {
                Name = "Pizza Palace",
                Category = "Pizza",
                CuisineType = "Italian",
                Address = "123 Main St, Downtown Toronto",
                Province = "ON",
                Latitude = 43.6532,
                Longitude = -79.3832,
                Phone = "+1-555-0101",
                Rating = 4.5m,
                Description = "Authentic Italian pizza with wood-fired oven",
                ImageUrl = "https://images.unsplash.com/photo-1513104890138-7c749659a591"
            },
            new Restaurant
            {
                Name = "Slice of Heaven",
                Category = "Pizza",
                CuisineType = "Italian",
                Address = "456 Oak Ave, Midtown Toronto",
                Province = "ON",
                Latitude = 43.6629,
                Longitude = -79.3957,
                Phone = "+1-555-0102",
                Rating = 4.7m,
                Description = "New York style pizza and Italian specialties",
                ImageUrl = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38"
            },
            // Burger restaurants - Vancouver
            new Restaurant
            {
                Name = "Burger Barn",
                Category = "Burgers",
                CuisineType = "American",
                Address = "789 Elm St, Vancouver",
                Province = "BC",
                Latitude = 49.2827,
                Longitude = -123.1207,
                Phone = "+1-555-0103",
                Rating = 4.3m,
                Description = "Gourmet burgers with fresh ingredients",
                ImageUrl = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd"
            },
            new Restaurant
            {
                Name = "The Burger Joint",
                Category = "Burgers",
                CuisineType = "American",
                Address = "321 Pine Rd, Vancouver",
                Province = "BC",
                Latitude = 49.2845,
                Longitude = -123.1090,
                Phone = "+1-555-0104",
                Rating = 4.6m,
                Description = "Classic American burgers and fries",
                ImageUrl = "https://images.unsplash.com/photo-1550547660-d9450f859349"
            },
            // Sushi restaurants - Toronto
            new Restaurant
            {
                Name = "Sushi Master",
                Category = "Sushi",
                CuisineType = "Japanese",
                Address = "555 Cherry Ln, Toronto",
                Province = "ON",
                Latitude = 43.6426,
                Longitude = -79.3871,
                Phone = "+1-555-0105",
                Rating = 4.8m,
                Description = "Fresh sushi and traditional Japanese cuisine",
                ImageUrl = "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351"
            },
            new Restaurant
            {
                Name = "Tokyo Sushi Bar",
                Category = "Sushi",
                CuisineType = "Japanese",
                Address = "888 Maple Dr, Toronto",
                Province = "ON",
                Latitude = 43.6511,
                Longitude = -79.3470,
                Phone = "+1-555-0106",
                Rating = 4.4m,
                Description = "Authentic Japanese sushi and sake bar",
                ImageUrl = "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10"
            },
            // Mexican restaurants - Vancouver
            new Restaurant
            {
                Name = "Taco Fiesta",
                Category = "Tacos",
                CuisineType = "Mexican",
                Address = "999 Cedar Blvd, Vancouver",
                Province = "BC",
                Latitude = 49.2665,
                Longitude = -123.1419,
                Phone = "+1-555-0107",
                Rating = 4.2m,
                Description = "Authentic Mexican tacos and burritos",
                ImageUrl = "https://images.unsplash.com/photo-1565299585323-38d6b0865b47"
            },
            new Restaurant
            {
                Name = "La Cantina",
                Category = "Mexican",
                CuisineType = "Mexican",
                Address = "777 Birch Way, Vancouver",
                Province = "BC",
                Latitude = 49.2750,
                Longitude = -123.1020,
                Phone = "+1-555-0108",
                Rating = 4.5m,
                Description = "Traditional Mexican food and margaritas",
                ImageUrl = "https://images.unsplash.com/photo-1613514785940-daed07799d9b"
            },
            // Asian restaurants - Toronto
            new Restaurant
            {
                Name = "Dragon Wok",
                Category = "Chinese",
                CuisineType = "Chinese",
                Address = "111 Willow St, Chinatown Toronto",
                Province = "ON",
                Latitude = 43.6529,
                Longitude = -79.3988,
                Phone = "+1-555-0109",
                Rating = 4.3m,
                Description = "Szechuan and Cantonese cuisine",
                ImageUrl = "https://images.unsplash.com/photo-1526318896980-cf78c088247c"
            },
            new Restaurant
            {
                Name = "Thai Spice",
                Category = "Thai",
                CuisineType = "Thai",
                Address = "222 Bamboo Ave, Toronto",
                Province = "ON",
                Latitude = 43.6555,
                Longitude = -79.3626,
                Phone = "+1-555-0110",
                Rating = 4.6m,
                Description = "Authentic Thai curries and pad thai",
                ImageUrl = "https://images.unsplash.com/photo-1559314809-0d155014e29e"
            },
            // Pasta/Italian restaurants - Vancouver
            new Restaurant
            {
                Name = "Pasta Paradise",
                Category = "Pasta",
                CuisineType = "Italian",
                Address = "333 Rome St, Vancouver",
                Province = "BC",
                Latitude = 49.2805,
                Longitude = -123.1089,
                Phone = "+1-555-0111",
                Rating = 4.7m,
                Description = "Homemade pasta and Italian wines",
                ImageUrl = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9"
            },
            // Steakhouse - Vancouver
            new Restaurant
            {
                Name = "The Steakhouse",
                Category = "Steak",
                CuisineType = "American",
                Address = "444 Beef Blvd, Vancouver",
                Province = "BC",
                Latitude = 49.2893,
                Longitude = -123.1118,
                Phone = "+1-555-0112",
                Rating = 4.8m,
                Description = "Premium steaks and fine dining",
                ImageUrl = "https://images.unsplash.com/photo-1600891964092-4316c288032e"
            },
            // Indian - Toronto
            new Restaurant
            {
                Name = "Curry House",
                Category = "Indian",
                CuisineType = "Indian",
                Address = "666 Spice Rd, Toronto",
                Province = "ON",
                Latitude = 43.6708,
                Longitude = -79.3899,
                Phone = "+1-555-0113",
                Rating = 4.4m,
                Description = "Traditional Indian curries and tandoori",
                ImageUrl = "https://images.unsplash.com/photo-1585937421612-70a008356fbe"
            },
            // Seafood - Vancouver
            new Restaurant
            {
                Name = "Ocean's Catch",
                Category = "Seafood",
                CuisineType = "Seafood",
                Address = "555 Harbor Dr, Vancouver Waterfront",
                Province = "BC",
                Latitude = 49.2877,
                Longitude = -123.1190,
                Phone = "+1-555-0114",
                Rating = 4.5m,
                Description = "Fresh seafood and oyster bar",
                ImageUrl = "https://images.unsplash.com/photo-1559339352-11d035aa65de"
            },
            // Breakfast/Brunch - Toronto
            new Restaurant
            {
                Name = "Morning Glory Cafe",
                Category = "Breakfast",
                CuisineType = "American",
                Address = "777 Sunrise Ave, Toronto",
                Province = "ON",
                Latitude = 43.6615,
                Longitude = -79.3790,
                Phone = "+1-555-0115",
                Rating = 4.6m,
                Description = "All-day breakfast and brunch favorites",
                ImageUrl = "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666"
            }
        };

        context.Restaurants.AddRange(restaurants);
        context.SaveChanges();
    }
}
