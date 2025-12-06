using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Data;
using WhatToEat.API.Services;
using WhatToEat.API.Settings;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure PostgreSQL database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Yelp API settings
builder.Services.Configure<YelpApiSettings>(builder.Configuration.GetSection("YelpApi"));

// Register Yelp service with HttpClient
builder.Services.AddHttpClient<IYelpService, YelpService>();

// Configure CORS to allow frontend to access the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// Initialize database with seed data
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        logger.LogInformation("Starting database initialization...");
        var context = services.GetRequiredService<ApplicationDbContext>();

        logger.LogInformation("Checking if database can connect...");
        var canConnect = context.Database.CanConnect();
        logger.LogInformation($"Database CanConnect result: {canConnect}");

        if (canConnect)
        {
            // Check if tables exist by trying to query
            try
            {
                var count = context.Restaurants.Count();
                logger.LogInformation($"Database already initialized with {count} restaurants.");
            }
            catch
            {
                // Tables don't exist, need to recreate database
                logger.LogWarning("Database exists but tables are missing. Dropping and recreating database...");
                context.Database.EnsureDeleted();
                context.Database.EnsureCreated();
                logger.LogInformation("Database recreated successfully.");
            }
        }
        else
        {
            logger.LogInformation("Creating new database...");
            context.Database.EnsureCreated();
            logger.LogInformation("Database created successfully.");
        }

        logger.LogInformation("Initializing seed data...");
        DbInitializer.Initialize(context);
        logger.LogInformation("Database initialization completed successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while initializing the database.");
        throw; // Re-throw to prevent app from starting with broken database
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// Serve static files from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

app.Run();
