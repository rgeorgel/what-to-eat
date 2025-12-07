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

            entity.HasIndex(e => e.ShareUrl).IsUnique();
            entity.HasIndex(e => e.UserId);

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
    }
}
