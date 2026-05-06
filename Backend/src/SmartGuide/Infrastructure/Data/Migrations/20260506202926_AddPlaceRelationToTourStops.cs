using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceRelationToTourStops : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PlaceId",
                table: "TourStops",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_TourStops_PlaceId",
                table: "TourStops",
                column: "PlaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_TourStops_Places_PlaceId",
                table: "TourStops",
                column: "PlaceId",
                principalTable: "Places",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TourStops_Places_PlaceId",
                table: "TourStops");

            migrationBuilder.DropIndex(
                name: "IX_TourStops_PlaceId",
                table: "TourStops");

            migrationBuilder.DropColumn(
                name: "PlaceId",
                table: "TourStops");
        }
    }
}
