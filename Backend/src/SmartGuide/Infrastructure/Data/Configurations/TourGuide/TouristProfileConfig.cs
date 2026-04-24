using Domain.Entities.Profiles.Tourist;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.TourGuide
{
    public class TouristProfileConfig : IEntityTypeConfiguration<TouristProfile>
    {
        public void Configure(EntityTypeBuilder<TouristProfile> builder)
        {
            builder.ToTable("TouristProfiles");
            builder.HasKey(x => x.Id);

            builder.HasOne<ApplicationUser>()
                .WithOne(x => x.TouristProfile)
                .HasForeignKey<TouristProfile>(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
