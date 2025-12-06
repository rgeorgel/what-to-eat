# Yelp API Setup Guide

## Quick Setup (2 minutes)

### 1. Get Your Yelp API Key

1. Go to [Yelp for Developers](https://www.yelp.com/developers)
2. Log in or create an account
3. Click [Create New App](https://www.yelp.com/developers/v3/manage_app)
4. Fill in the application details:
   - **App Name**: What To Eat
   - **Industry**: Food & Dining
   - **Contact Email**: your email
   - **Description**: Restaurant discovery application
5. Copy the **API Key** that appears after creation

### 2. Configure for Docker (Recommended)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and replace `YOUR_YELP_API_KEY_HERE` with your actual API key:

```env
YELP_API_KEY=your_actual_api_key_here
```

### 3. Restart Docker

```bash
docker-compose down
docker-compose up --build
```

That's it! The Yelp integration is now working.

## Testing the Integration

Try importing Toronto restaurants:

```bash
curl -X POST "http://localhost:8080/api/restaurantimport/from-toronto?limit=50&radius=10000"
```

You should see a response like:

```json
{
  "success": true,
  "message": "Successfully imported 50 restaurants",
  "totalFetched": 50,
  "totalSaved": 50,
  "totalSkipped": 0
}
```

## Alternative: Local Development Setup

If you're running the application locally (not in Docker), update `src/WhatToEat.API/appsettings.json`:

```json
{
  "YelpApi": {
    "ApiKey": "your_actual_api_key_here",
    "BaseUrl": "https://api.yelp.com/v3",
    "DefaultLimit": 50,
    "DefaultRadius": 10000
  }
}
```

**Important**: Don't commit your API key to git! The `.gitignore` file is configured to ignore `.env` and `appsettings.json` changes.

## Available Endpoints

### 1. Import from Toronto (easiest)
```bash
POST /api/restaurantimport/from-toronto?limit=100&radius=15000
```

### 2. Import by location name
```bash
POST /api/restaurantimport/from-location?location=Toronto,ON&limit=100
```

### 3. Import by coordinates
```bash
POST /api/restaurantimport/from-coordinates?latitude=43.6532&longitude=-79.3832&radius=10000&limit=100
```

## Parameters

- **limit**: Number of restaurants to fetch (max 1000, default 50)
- **radius**: Search radius in meters (max 40000m = 40km, default 10000m)
- **skipDuplicates**: Skip duplicate restaurants (default true)

## Troubleshooting

### 400 Bad Request Error

This usually means:
- Invalid API key - check your `.env` file
- API key not loaded - restart Docker containers

### No Restaurants Found

- Increase the radius parameter
- Try different coordinates
- Check if Yelp has data for that location

### Rate Limiting

Yelp API has rate limits:
- 5000 calls per day for free tier
- Recommended to fetch in batches of 50-200

## Yelp API Limits

- **Max limit per request**: 50 businesses
- **Max radius**: 40,000 meters (40km)
- **Max offset**: 1000 (for pagination)
- **Daily quota**: 5000 API calls (free tier)

To import more than 50 restaurants, the application automatically handles pagination.

## Security Note

Never commit your API key to version control!

The `.gitignore` file is configured to ignore:
- `.env` file
- Changes to `appsettings.json`

Always use environment variables for sensitive data.
