using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class EditBookingTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_GuideId_Date",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "BookingDate",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Bookings");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "Bookings",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_GuideId",
                table: "Bookings",
                column: "GuideId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Bookings_GuideId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "Bookings");

            migrationBuilder.AddColumn<DateOnly>(
                name: "BookingDate",
                table: "Bookings",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "EndTime",
                table: "Bookings",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.AddColumn<TimeOnly>(
                name: "StartTime",
                table: "Bookings",
                type: "time",
                nullable: false,
                defaultValue: new TimeOnly(0, 0, 0));

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_GuideId_Date",
                table: "Bookings",
                columns: new[] { "GuideId", "BookingDate" });
        }
    }
}
