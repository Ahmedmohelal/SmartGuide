using Domain.Entities.Home;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Profiles.Tourist;
using Domain.Entities.Tours;
using Infrastructure.Data.Entities;
using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data.Configurations.RefreshToken;
using Domain.Entities.Book;
using Domain.Entities.Favorites;

namespace Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
        public DbSet<TourGuideProfile> TourGuideProfiles { get; set; }
        public DbSet<TouristProfile> TouristProfiles { get; set; }
        public DbSet<TourGuideCity> TourGuideCities { get; set; }
        public DbSet<TourGuideLanguage> TourGuideLanguages { get; set; }
        public DbSet<TourGuideGallery> TourGuideGallery { get; set; }
        public DbSet<SavedTourGuide> SavedTourGuides { get; set; }

        public DbSet<Tour> Tours { get; set; }
        public DbSet<TourStops> TourStops { get; set; }
        public DbSet<TourInclusion> TourInclusions { get; set; }
        public DbSet<TourImage> TourImages { get; set; }
        public DbSet<TourAddOn> TourAddOns { get; set; }
        public DbSet<Place> Places { get; set; }


        public DbSet<Booking> Bookings { get; set; }

        public DbSet<BookingSlot> BookingsSlot { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(typeof(RefreshTokenConfig).Assembly);
        }
    }
}
