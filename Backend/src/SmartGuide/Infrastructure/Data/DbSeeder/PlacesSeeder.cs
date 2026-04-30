using CsvHelper;
using Domain.Entities.Home;
using Microsoft.AspNetCore.Hosting;
using System.Globalization;

namespace Infrastructure.Data.DbSeeder
{
    public class PlacesSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;

        public PlacesSeeder(ApplicationDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        public async Task SeedPlacesAsync()
        {
            if (_context.Places.Any())
                return;

            var filePath = Path.Combine(_env.ContentRootPath, "Data", "Egypt_Heritage_Final.csv");

            using var reader = new StreamReader(filePath);
            var config = new CsvHelper.Configuration.CsvConfiguration(CultureInfo.InvariantCulture)
            {
                BadDataFound = null,          // متوقفش على errors
                MissingFieldFound = null,     // لو field ناقص كمل
                HeaderValidated = null        // لو header فيه مشكلة تجاهل
            };
            using var csv = new CsvReader(reader, configuration : config);

            csv.Read();
            csv.ReadHeader();
            int count = 0;

            while (csv.Read())
            {
                var raw = csv.GetField("Approx Start Year");

                var cleaned = raw?
                    .Trim()
                    .Replace("−", "-"); // fix unicode minus

                var place = new Place
                {
                    Name = csv.GetField("Name"),
                    Type = csv.GetField("Type"),

                    Description = csv.GetField("Detailed Historical Background"),

                    Location = csv.GetField("Location"),
                    City = csv.GetField("City/Region"),
                    Governorate = csv.GetField("Governorate"),

                    ImageUrl = csv.GetField("Image_URL"),

                    CreatedBy = csv.GetField("Created By / Associated With"),
                    HistoricalBackground = csv.GetField("Detailed Historical Background"),

                    Period = csv.GetField("Date / Period"),

                    StartYear = int.TryParse(cleaned, out int y) ? y : null,

                    Rating = 0
                };

                Console.WriteLine($"Rows Read: {count}");
                _context.Places.Add(place);
            }

            await _context.SaveChangesAsync();
        }
    }
}