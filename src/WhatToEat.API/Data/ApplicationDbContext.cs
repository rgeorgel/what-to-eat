using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WhatToEat.API.Models;

namespace WhatToEat.API.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Restaurant> Restaurants { get; set; } = null!;
    public DbSet<FavoriteList> FavoriteLists { get; set; } = null!;
    public DbSet<ListItem> ListItems { get; set; } = null!;
    public DbSet<ListFollower> ListFollowers { get; set; } = null!;
    public DbSet<NeighborhoodGuide> NeighborhoodGuides { get; set; } = null!;
    public DbSet<GuideRestaurant> GuideRestaurants { get; set; } = null!;
    public DbSet<RouteItinerary> RouteItineraries { get; set; } = null!;
    public DbSet<RouteStop> RouteStops { get; set; } = null!;
    public DbSet<Tag> Tags { get; set; } = null!;
    public DbSet<ListTag> ListTags { get; set; } = null!;
    public DbSet<GuideTag> GuideTags { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Restaurant entity
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(100);
            entity.Property(e => e.CuisineType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Latitude).IsRequired();
            entity.Property(e => e.Longitude).IsRequired();
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.ImageUrl).HasMaxLength(500);

            entity.HasIndex(e => e.Category);
            entity.HasIndex(e => e.CuisineType);
            entity.HasIndex(e => new { e.Latitude, e.Longitude });
        });

        // Configure ApplicationUser entity
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(e => e.DisplayName).IsRequired().HasMaxLength(100);
        });

        // Configure FavoriteList entity
        modelBuilder.Entity<FavoriteList>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.ShareUrl).HasMaxLength(100);
            entity.Property(e => e.ListType).IsRequired().HasDefaultValue(ListType.Favorites);

            entity.HasIndex(e => e.ShareUrl).IsUnique();
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.ListType);

            entity.HasOne(e => e.User)
                .WithMany(u => u.FavoriteLists)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ListItem entity
        modelBuilder.Entity<ListItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasIndex(e => new { e.FavoriteListId, e.RestaurantId }).IsUnique();

            entity.HasOne(e => e.FavoriteList)
                .WithMany(fl => fl.ListItems)
                .HasForeignKey(e => e.FavoriteListId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Restaurant)
                .WithMany()
                .HasForeignKey(e => e.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure ListFollower entity
        modelBuilder.Entity<ListFollower>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.UserId, e.FavoriteListId }).IsUnique();

            entity.HasOne(e => e.User)
                .WithMany(u => u.FollowingLists)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.FavoriteList)
                .WithMany(fl => fl.Followers)
                .HasForeignKey(e => e.FavoriteListId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure NeighborhoodGuide entity
        modelBuilder.Entity<NeighborhoodGuide>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.NeighborhoodName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UserId).IsRequired();
            entity.Property(e => e.ImageUrl).HasMaxLength(500);

            entity.HasIndex(e => e.NeighborhoodName);
            entity.HasIndex(e => e.UserId);
            entity.HasIndex(e => e.IsOfficial);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure GuideRestaurant entity
        modelBuilder.Entity<GuideRestaurant>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Description).HasMaxLength(500);

            entity.HasIndex(e => new { e.NeighborhoodGuideId, e.RestaurantId }).IsUnique();
            entity.HasIndex(e => new { e.NeighborhoodGuideId, e.Order });

            entity.HasOne(e => e.NeighborhoodGuide)
                .WithMany(ng => ng.GuideRestaurants)
                .HasForeignKey(e => e.NeighborhoodGuideId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Restaurant)
                .WithMany()
                .HasForeignKey(e => e.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RouteItinerary entity
        modelBuilder.Entity<RouteItinerary>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.UserId).IsRequired();

            entity.HasIndex(e => e.UserId);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure RouteStop entity
        modelBuilder.Entity<RouteStop>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasIndex(e => new { e.RouteItineraryId, e.Order });
            entity.HasIndex(e => new { e.RouteItineraryId, e.RestaurantId }).IsUnique();

            entity.HasOne(e => e.RouteItinerary)
                .WithMany(ri => ri.RouteStops)
                .HasForeignKey(e => e.RouteItineraryId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Restaurant)
                .WithMany()
                .HasForeignKey(e => e.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure Tag entity
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);

            entity.HasIndex(e => e.Name).IsUnique();
        });

        // Configure ListTag entity
        modelBuilder.Entity<ListTag>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.FavoriteListId, e.TagId }).IsUnique();

            entity.HasOne(e => e.FavoriteList)
                .WithMany(fl => fl.ListTags)
                .HasForeignKey(e => e.FavoriteListId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.ListTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configure GuideTag entity
        modelBuilder.Entity<GuideTag>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasIndex(e => new { e.NeighborhoodGuideId, e.TagId }).IsUnique();

            entity.HasOne(e => e.NeighborhoodGuide)
                .WithMany(ng => ng.GuideTags)
                .HasForeignKey(e => e.NeighborhoodGuideId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Tag)
                .WithMany(t => t.GuideTags)
                .HasForeignKey(e => e.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
