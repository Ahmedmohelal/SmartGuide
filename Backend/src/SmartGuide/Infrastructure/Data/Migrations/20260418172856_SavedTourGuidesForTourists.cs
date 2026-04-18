using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class SavedTourGuidesForTourists : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FavoriteTourGuides",
                columns: table => new
                {
                    TouristUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TourGuideUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FavoriteTourGuides", x => new { x.TouristUserId, x.TourGuideUserId });
                });

            migrationBuilder.CreateIndex(
                name: "IX_FavoriteTourGuides_TouristUserId_CreatedAtUtc",
                table: "FavoriteTourGuides",
                columns: new[] { "TouristUserId", "CreatedAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FavoriteTourGuides");
        }
    }
}
