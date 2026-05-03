using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTourIdToSlotAndBookingAddOns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_GuideId_Date_StartTime",
                table: "BookingSlots");

            migrationBuilder.AddColumn<Guid>(
                name: "TourId",
                table: "BookingSlots",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE bs
                SET TourId = t.Id
                FROM BookingSlots bs
                OUTER APPLY (
                    SELECT TOP 1 Id FROM Tours WHERE GuideId = bs.GuideId ORDER BY Id
                ) t
                WHERE bs.TourId IS NULL AND t.Id IS NOT NULL;
                """);

            migrationBuilder.Sql("DELETE FROM BookingSlots WHERE TourId IS NULL;");

            migrationBuilder.AlterColumn<Guid>(
                name: "TourId",
                table: "BookingSlots",
                type: "uniqueidentifier",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_TourId",
                table: "BookingSlots",
                column: "TourId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_TourId_Date_StartTime",
                table: "BookingSlots",
                columns: new[] { "TourId", "Date", "StartTime" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookingSlots_Tours_TourId",
                table: "BookingSlots",
                column: "TourId",
                principalTable: "Tours",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.CreateTable(
                name: "BookingAddOns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TourAddOnId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BookingAddOns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BookingAddOns_Bookings_BookingId",
                        column: x => x.BookingId,
                        principalTable: "Bookings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BookingAddOns_TourAddOns_TourAddOnId",
                        column: x => x.TourAddOnId,
                        principalTable: "TourAddOns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BookingAddOns_BookingId",
                table: "BookingAddOns",
                column: "BookingId");

            migrationBuilder.CreateIndex(
                name: "IX_BookingAddOns_TourAddOnId",
                table: "BookingAddOns",
                column: "TourAddOnId");

            migrationBuilder.Sql("""
                IF COL_LENGTH('dbo.Bookings', 'BookingDate') IS NOT NULL
                    ALTER TABLE Bookings DROP COLUMN BookingDate;
                IF COL_LENGTH('dbo.Bookings', 'StartTime') IS NOT NULL
                    ALTER TABLE Bookings DROP COLUMN StartTime;
                IF COL_LENGTH('dbo.Bookings', 'EndTime') IS NOT NULL
                    ALTER TABLE Bookings DROP COLUMN EndTime;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookingAddOns");

            migrationBuilder.DropForeignKey(
                name: "FK_BookingSlots_Tours_TourId",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_TourId_Date_StartTime",
                table: "BookingSlots");

            migrationBuilder.DropIndex(
                name: "IX_BookingSlots_TourId",
                table: "BookingSlots");

            migrationBuilder.DropColumn(
                name: "TourId",
                table: "BookingSlots");

            migrationBuilder.CreateIndex(
                name: "IX_BookingSlots_GuideId_Date_StartTime",
                table: "BookingSlots",
                columns: new[] { "GuideId", "Date", "StartTime" },
                unique: true);
        }
    }
}
