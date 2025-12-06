# Quick Start Guide

Get the "What to Eat" application running in 5 minutes!

## Prerequisites

- .NET 8 SDK installed
- Docker Desktop (for easy PostgreSQL setup)

## Option 1: Using Docker (Recommended)

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the database ready to use.

### 2. Run the Application

```bash
cd src/WhatToEat.API
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

### 3. Open Your Browser

Navigate to: **http://localhost:5000**

That's it! The application is running with sample restaurant data.

## Option 2: Using Existing PostgreSQL

### 1. Update Connection String

Edit `src/WhatToEat.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=whattoeat;Username=YOUR_USERNAME;Password=YOUR_PASSWORD"
  }
}
```

### 2. Run the Application

```bash
cd src/WhatToEat.API
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

### 3. Open Your Browser

Navigate to: **http://localhost:5000**

## Features to Try

1. **Search**: Type "pizza" or "sushi" in the search box
2. **Near Me**: Click "Near Me" button (allow location access)
3. **Filters**: Try different categories and cuisine types
4. **Map View**: Click "Map View" to see restaurants on a map
5. **API**: Check out the API docs at **http://localhost:5000/swagger**

## Common Issues

### Port Already in Use

```bash
dotnet run --urls "http://localhost:5002"
```

### Database Connection Failed

Make sure PostgreSQL is running:
```bash
docker ps  # Should show whattoeat-db container
```

Or restart the container:
```bash
docker-compose restart
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the sample data in `src/WhatToEat.API/Data/DbInitializer.cs`
- Explore the API endpoints in Swagger
- Modify the styling in `wwwroot/css/styles.css`

Happy coding! 🍽️
