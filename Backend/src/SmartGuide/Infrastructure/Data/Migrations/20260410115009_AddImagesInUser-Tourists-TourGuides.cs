using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImagesInUserTouristsTourGuides : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ProfilePictureUrl",
                table: "TourGuideProfiles",
                newName: "ProfilePicture");

            migrationBuilder.AddColumn<string>(
                name: "TouristImage",
                table: "TouristProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfileImage",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TouristImage",
                table: "TouristProfiles");

            migrationBuilder.DropColumn(
                name: "ProfileImage",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "ProfilePicture",
                table: "TourGuideProfiles",
                newName: "ProfilePictureUrl");
        }
    }
}
