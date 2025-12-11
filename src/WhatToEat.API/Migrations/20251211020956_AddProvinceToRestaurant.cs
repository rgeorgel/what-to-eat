using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WhatToEat.API.Migrations
{
    /// <inheritdoc />
    public partial class AddProvinceToRestaurant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Province",
                table: "Restaurants",
                type: "character varying(2)",
                maxLength: 2,
                nullable: false,
                defaultValue: "ON");

            migrationBuilder.CreateIndex(
                name: "IX_Restaurants_Province",
                table: "Restaurants",
                column: "Province");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Restaurants_Province",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Province",
                table: "Restaurants");
        }

    }
}
