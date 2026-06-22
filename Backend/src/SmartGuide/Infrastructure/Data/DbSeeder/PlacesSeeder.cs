using CsvHelper;
using Domain.Entities.Home;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
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

        public async Task UpdateFirst10ImagesAsync()
        {
            var imageUrls = new[]
            {
"https://almatar.com/blog/wp-content/uploads/2022/07/%D8%A7%D9%84%D8%B3%D9%8A%D8%A7%D8%AD%D8%A9-%D9%81%D9%8A-%D9%85%D8%B5%D8%B1.jpg",
  "https://cdn.alweb.com/thumbs/travel/article/fit710x532/%D8%A3%D9%85%D8%A7%D9%83%D9%86-%D8%B3%D9%8A%D8%A7%D8%AD%D9%8A%D8%A9-%D9%81%D9%8A-%D9%85%D8%B5%D8%B1-%D9%84%D9%84%D8%A7%D8%B3%D8%AA%D8%AC%D9%85%D8%A7%D9%85-%D8%A5%D9%84%D9%8A%D9%83-%D8%A3%D9%81%D8%B6%D9%84%D9%87%D8%A7.jpg",
  "https://media-cdn.tripadvisor.com/media/photo-s/1a/2b/f9/91/caption.jpg",
  "https://cnn-arabic-images.cnn.io/cloudinary/image/upload/w_900,h_506,c_fill,q_auto,g_center/cnnarabic/2020/07/01/images/158782.jpg",
  "https://cnn-arabic-images.cnn.io/cloudinary/image/upload/w_960,c_scale,q_auto/cnnarabic/2020/07/01/images/158753.jpg",
  "https://tripsegypt.net/storage/1665/conversions/111-webp.webp",
  "https://koon-sa.com/wp-content/uploads/2024/05/%D9%86%D8%B5-%D9%81%D9%82%D8%B1%D8%AA%D9%83-2024-05-30T203039.065.jpg",
  "https://blog.flysepehran.com/wp-content/uploads/2024/05/%D9%82%D9%84%D8%B9%D9%87-%D8%B5%D9%84%D8%A7%D8%AD-%D8%A7%D9%84%D8%AF%DB%8C%D9%86.jpg",
  "https://travelerlibrary.com/wp-content/uploads/Nile-Corniche.jpg",
  "https://travilia.com/uploads/0000/8/2024/08/23/g3qmlb-i.jpeg",
    };

            var places = await _context.Places
                .OrderBy(x => x.Id)
                .Take(10)
                .ToListAsync();

            for (int i = 0; i < places.Count; i++)
            {
                places[i].ImageUrl = imageUrls[i];
            }

            await _context.SaveChangesAsync();
        }

    }
}


