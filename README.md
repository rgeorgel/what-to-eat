# What to Eat - Restaurant Finder Application

A modern web application that helps users find restaurants based on their food preferences and location. Built with .NET 8, PostgreSQL, and vanilla JavaScript.

## Features

- 🔍 **Smart Search**: Search restaurants by name, category, cuisine type, or description
- 📍 **Location-Based Search**: Find restaurants near you with geolocation support
- 📋 **List View**: Browse restaurants in a beautiful card-based layout
- 🗺️ **Map View**: Visualize restaurant locations on an interactive map using Leaflet.js
- 🏷️ **Filtering**: Filter by category, cuisine type, and distance radius
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- ⭐ **Restaurant Details**: View ratings, descriptions, addresses, and phone numbers

## Tech Stack

### Backend
- **.NET 8**: Web API framework
- **Entity Framework Core**: ORM for database operations
- **PostgreSQL**: Relational database
- **Swagger**: API documentation

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Leaflet.js**: Interactive maps

## Prerequisites

Before running this application, ensure you have the following installed:

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 12+](https://www.postgresql.org/download/)
- A modern web browser

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd what-to-eat
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE whattoeat;

# Exit psql
\q
```

### 3. Configure Database Connection

Update the connection string in `src/WhatToEat.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=whattoeat;Username=postgres;Password=your_password"
  }
}
```

Replace `your_password` with your PostgreSQL password.

### 4. Install Dependencies and Run Migrations

Navigate to the API project directory:

```bash
cd src/WhatToEat.API
```

Restore NuGet packages:

```bash
dotnet restore
```

Create and apply database migrations:

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

Note: The application will automatically seed sample restaurant data on first run.

### 5. Run the Application

```bash
dotnet run
```

The application will start and be available at:
- **Application**: https://localhost:5001 or http://localhost:5000
- **Swagger API Documentation**: https://localhost:5001/swagger

## Using the Application

### Search for Restaurants

1. **Text Search**: Enter what you want to eat (e.g., "pizza", "sushi", "burgers") in the search box
2. **Filter by Category**: Select a specific category from the dropdown
3. **Filter by Cuisine**: Select a cuisine type from the dropdown
4. Click **Search** to find restaurants

### Find Restaurants Near You

1. Click the **Near Me** button
2. Allow location access when prompted by your browser
3. Adjust the radius using the dropdown (1-20 km)
4. Results will show restaurants sorted by distance

### Switch Between Views

- Click **List View** to see restaurants in a card layout with detailed information
- Click **Map View** to see restaurant locations on an interactive map
- Click on map markers to see restaurant details in popups

## API Endpoints

### Restaurants

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/{id}` - Get restaurant by ID
- `GET /api/restaurants/search?query={query}&category={category}&cuisineType={cuisineType}` - Search restaurants
- `GET /api/restaurants/nearby?latitude={lat}&longitude={lng}&radiusKm={radius}&category={category}` - Get nearby restaurants
- `GET /api/restaurants/categories` - Get all unique categories
- `GET /api/restaurants/cuisine-types` - Get all unique cuisine types
- `POST /api/restaurants` - Create a new restaurant
- `PUT /api/restaurants/{id}` - Update a restaurant
- `DELETE /api/restaurants/{id}` - Delete a restaurant

### Example API Calls

**Search for pizza restaurants:**
```
GET /api/restaurants/search?query=pizza
```

**Find restaurants near a location:**
```
GET /api/restaurants/nearby?latitude=40.7128&longitude=-74.0060&radiusKm=5
```

**Get all categories:**
```
GET /api/restaurants/categories
```

## Project Structure

```
what-to-eat/
├── src/
│   └── WhatToEat.API/
│       ├── Controllers/
│       │   └── RestaurantsController.cs
│       ├── Data/
│       │   ├── ApplicationDbContext.cs
│       │   └── DbInitializer.cs
│       ├── Models/
│       │   └── Restaurant.cs
│       ├── wwwroot/
│       │   ├── css/
│       │   │   └── styles.css
│       │   ├── js/
│       │   │   └── app.js
│       │   └── index.html
│       ├── appsettings.json
│       ├── Program.cs
│       └── WhatToEat.API.csproj
├── WhatToEat.sln
└── README.md
```

## Database Schema

### Restaurants Table

| Column | Type | Description |
|--------|------|-------------|
| Id | int | Primary key |
| Name | string | Restaurant name |
| Category | string | Food category (Pizza, Burgers, etc.) |
| CuisineType | string | Cuisine type (Italian, American, etc.) |
| Address | string | Full address |
| Latitude | double | GPS latitude |
| Longitude | double | GPS longitude |
| Phone | string | Phone number (optional) |
| Rating | decimal | Rating out of 5 (optional) |
| Description | string | Restaurant description (optional) |
| ImageUrl | string | Image URL (optional) |
| CreatedAt | datetime | Creation timestamp |

## Sample Data

The application comes pre-loaded with 15 sample restaurants including:
- Pizza restaurants
- Burger joints
- Sushi bars
- Mexican restaurants
- Chinese and Thai cuisine
- Italian pasta restaurants
- Steakhouses
- Indian restaurants
- Seafood restaurants
- Breakfast cafes

All sample restaurants are located in the New York City area for demonstration purposes.

## Customization

### Adding More Restaurants

You can add restaurants through:

1. **Swagger UI**: Navigate to `/swagger` and use the POST endpoint
2. **API**: Send POST request to `/api/restaurants`
3. **Database**: Insert directly into PostgreSQL

Example restaurant JSON:
```json
{
  "name": "My Restaurant",
  "category": "Italian",
  "cuisineType": "Italian",
  "address": "123 Main St",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "phone": "+1-555-0123",
  "rating": 4.5,
  "description": "Best Italian food in town",
  "imageUrl": "https://example.com/image.jpg"
}
```

### Customizing the Theme

Edit `/wwwroot/css/styles.css` and modify the CSS variables:

```css
:root {
    --primary-color: #ff6b6b;
    --secondary-color: #4ecdc4;
    --dark-color: #2c3e50;
    /* ... other colors */
}
```

## Development

### Running in Development Mode

```bash
cd src/WhatToEat.API
dotnet watch run
```

This enables hot reload - the application will automatically restart when you make code changes.

### Viewing Logs

Logs are displayed in the console when running the application. For production, configure logging in `appsettings.json`.

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `sudo service postgresql status` (Linux) or check Services (Windows)
- Verify connection string in `appsettings.json`
- Check PostgreSQL logs for connection errors

### Migration Issues

If migrations fail, try:

```bash
# Remove existing migrations
dotnet ef database drop

# Recreate database
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Port Already in Use

If ports 5000/5001 are in use, modify `launchSettings.json` or specify a different port:

```bash
dotnet run --urls "http://localhost:5002;https://localhost:5003"
```

### Location Not Working

- Ensure you're accessing the application via HTTPS (required for geolocation API)
- Check browser permissions for location access
- Geolocation may not work on localhost in some browsers - use 127.0.0.1 instead

## Production Deployment

### Building for Production

```bash
dotnet publish -c Release -o ./publish
```

### Environment Variables

For production, set environment variables instead of using `appsettings.json`:

```bash
export ConnectionStrings__DefaultConnection="your-production-connection-string"
```

### Security Considerations

- Update CORS policy in `Program.cs` to restrict origins
- Use environment variables for sensitive data
- Enable HTTPS redirect
- Implement authentication/authorization for write operations
- Add rate limiting
- Use SSL for database connections

## Future Enhancements

- [ ] User accounts and favorites
- [ ] Restaurant reviews and comments
- [ ] Photo uploads
- [ ] Reservation system
- [ ] Menu integration
- [ ] Advanced search with dietary restrictions
- [ ] Social sharing features
- [ ] Mobile app (React Native/Flutter)

## License

This project is open source and available under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review the API documentation at `/swagger`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with ❤️ using .NET 8 and PostgreSQL
