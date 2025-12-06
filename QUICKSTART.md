# Quick Start Guide

Get the "What to Eat" application running in under 2 minutes! 🚀

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Easiest option)
- OR [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) + PostgreSQL (Manual setup)

## Option 1: Full Docker Stack (Recommended - Easiest!) 🐳

### 1. Start Everything with One Command

```bash
docker-compose up --build
```

**That's it!** The entire application stack is running:
- PostgreSQL database
- .NET 8 Web API
- Frontend application
- Sample restaurant data loaded

### 2. Open Your Browser

Navigate to: **http://localhost:8080**

The application is ready to use!

### Stop the Application

```bash
docker-compose down
```

---

## Option 2: Database Only in Docker

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d postgres
```

### 2. Run the Application Locally

```bash
cd src/WhatToEat.API
dotnet restore
dotnet run
```

### 3. Open Your Browser

Navigate to: **http://localhost:5000**

---

## Option 3: Using Existing PostgreSQL

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
dotnet run
```

### 3. Open Your Browser

Navigate to: **http://localhost:5000**

---

## Features to Try

1. **Search**: Type "pizza" or "sushi" in the search box
2. **Near Me**: Click "Near Me" button (allow location access)
3. **Filters**: Try different categories and cuisine types
4. **Map View**: Click "Map View" to see restaurants on a map
5. **API Docs**:
   - Docker: **http://localhost:8080/swagger**
   - Local: **http://localhost:5000/swagger**

## Common Issues

### Docker: View Logs

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs web
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Docker: Rebuild After Code Changes

```bash
docker-compose down
docker-compose up --build
```

### Port Already in Use (Local Development)

```bash
dotnet run --urls "http://localhost:5002"
```

### Database Connection Failed

**For Docker:**
```bash
# Check if containers are running
docker ps

# Restart services
docker-compose restart

# Reset everything
docker-compose down -v
docker-compose up --build
```

**For Local:**
```bash
# Check PostgreSQL status
docker ps  # If using Docker for database only
# Or check your local PostgreSQL service
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Customize the sample data in `src/WhatToEat.API/Data/DbInitializer.cs`
- Explore the API endpoints in Swagger
- Modify the styling in `wwwroot/css/styles.css`

Happy coding! 🍽️
