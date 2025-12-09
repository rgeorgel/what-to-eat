using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WhatToEat.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAllNewFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ListType",
                table: "FavoriteLists",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "NeighborhoodGuides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    NeighborhoodName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    IsOfficial = table.Column<bool>(type: "boolean", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NeighborhoodGuides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NeighborhoodGuides_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RouteItineraries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    StartLatitude = table.Column<double>(type: "double precision", nullable: true),
                    StartLongitude = table.Column<double>(type: "double precision", nullable: true),
                    EndLatitude = table.Column<double>(type: "double precision", nullable: true),
                    EndLongitude = table.Column<double>(type: "double precision", nullable: true),
                    IsOptimized = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteItineraries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RouteItineraries_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GuideRestaurants",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    NeighborhoodGuideId = table.Column<int>(type: "integer", nullable: false),
                    RestaurantId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GuideRestaurants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GuideRestaurants_NeighborhoodGuides_NeighborhoodGuideId",
                        column: x => x.NeighborhoodGuideId,
                        principalTable: "NeighborhoodGuides",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GuideRestaurants_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RouteStops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RouteItineraryId = table.Column<int>(type: "integer", nullable: false),
                    RestaurantId = table.Column<int>(type: "integer", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    AddedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteStops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RouteStops_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RouteStops_RouteItineraries_RouteItineraryId",
                        column: x => x.RouteItineraryId,
                        principalTable: "RouteItineraries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteLists_ListType",
                table: "FavoriteLists",
                column: "ListType");

            migrationBuilder.CreateIndex(
                name: "IX_GuideRestaurants_NeighborhoodGuideId_Order",
                table: "GuideRestaurants",
                columns: new[] { "NeighborhoodGuideId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_GuideRestaurants_NeighborhoodGuideId_RestaurantId",
                table: "GuideRestaurants",
                columns: new[] { "NeighborhoodGuideId", "RestaurantId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GuideRestaurants_RestaurantId",
                table: "GuideRestaurants",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_NeighborhoodGuides_IsOfficial",
                table: "NeighborhoodGuides",
                column: "IsOfficial");

            migrationBuilder.CreateIndex(
                name: "IX_NeighborhoodGuides_NeighborhoodName",
                table: "NeighborhoodGuides",
                column: "NeighborhoodName");

            migrationBuilder.CreateIndex(
                name: "IX_NeighborhoodGuides_UserId",
                table: "NeighborhoodGuides",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RouteItineraries_UserId",
                table: "RouteItineraries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_RestaurantId",
                table: "RouteStops",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_RouteItineraryId_Order",
                table: "RouteStops",
                columns: new[] { "RouteItineraryId", "Order" });

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_RouteItineraryId_RestaurantId",
                table: "RouteStops",
                columns: new[] { "RouteItineraryId", "RestaurantId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GuideRestaurants");

            migrationBuilder.DropTable(
                name: "RouteStops");

            migrationBuilder.DropTable(
                name: "NeighborhoodGuides");

            migrationBuilder.DropTable(
                name: "RouteItineraries");

            migrationBuilder.DropIndex(
                name: "IX_FavoriteLists_ListType",
                table: "FavoriteLists");

            migrationBuilder.DropColumn(
                name: "ListType",
                table: "FavoriteLists");
        }
    }
}
