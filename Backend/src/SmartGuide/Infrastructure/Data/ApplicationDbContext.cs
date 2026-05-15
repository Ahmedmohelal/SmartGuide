using Domain.Entities.Book;
using Domain.Entities.Favorites;
using Domain.Entities.Home;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Profiles.Tourist;
using Domain.Entities.SavedPlaces;
using Domain.Entities.Tours;
using Domain.Entities.Wallet;
using Domain.Entities.Admin;
using Infrastructure.Data.Configurations.RefreshTokens;
using Infrastructure.Data.Entities;
using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Domain.Entities.Chat;
using Domain.Entities.Notifications;

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

        public DbSet<BookingAddOn> BookingAddOns { get; set; }

        public DbSet<SavedPlace> SavedPlaces { get; set; }
        public DbSet<GuideWallet> GuideWallets { get; set; }
        public DbSet<GuideWalletTransaction> GuideWalletTransactions { get; set; }
        public DbSet<AdminAuditLog> AdminAuditLogs { get; set; }

        //public DbSet<SavedTourGuide> FavoriteTourGuides { get; set; }

        public DbSet<Conversation> ChatConversations { get; set; }
        public DbSet<ConversationParticipant> ChatConversationParticipants { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<ChatUserConnection> ChatUserConnections { get; set; }

        public DbSet<Notification> Notifications { get; set; }


        //public DbSet<SavedTourGuide> FavoriteTourGuides { get; set; }
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyConfigurationsFromAssembly(typeof(RefreshTokenConfig).Assembly);
        }
    }
}
