using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSavedPlaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TouristProfiles_UserId",
                table: "TouristProfiles");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_TouristProfiles_UserId",
                table: "TouristProfiles",
                column: "UserId");

            migrationBuilder.CreateTable(
                name: "SavedPlaces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TouristUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PlaceId = table.Column<int>(type: "int", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedPlaces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedPlaces_Places_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "Places",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SavedPlaces_TouristProfiles_TouristUserId",
                        column: x => x.TouristUserId,
                        principalTable: "TouristProfiles",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavedPlaces_PlaceId",
                table: "SavedPlaces",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedPlaces_TouristUserId_PlaceId",
                table: "SavedPlaces",
                columns: new[] { "TouristUserId", "PlaceId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavedPlaces");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_TouristProfiles_UserId",
                table: "TouristProfiles");

            migrationBuilder.CreateIndex(
                name: "IX_TouristProfiles_UserId",
                table: "TouristProfiles",
                column: "UserId",
                unique: true);
        }
    }
}
