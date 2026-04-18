using Domain.Entities;
using Infrastructure.Data.Configurations;
using Infrastructure.Data.Configurations.TourGuide;
using Infrastructure.Data.Entities;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Data.Entities.Profiles.TourGuide;
using Infrastructure.Data.Entities.Profiles.Tourist;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(typeof(RefreshTokenConfig).Assembly);
            builder.ApplyConfigurationsFromAssembly(typeof(TourGuideProfileConfig).Assembly);
            builder.ApplyConfigurationsFromAssembly(typeof(TourGuideCityConfig).Assembly);
            builder.ApplyConfigurationsFromAssembly(typeof(TourGuideGalleryConfig).Assembly);
            builder.ApplyConfigurationsFromAssembly(typeof(TourGuideLanguageConfig).Assembly);
            
        }
    }
}
