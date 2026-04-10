using Infrastructure.Data.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.TourGuide
{
    public class TourGuideProfileConfig : IEntityTypeConfiguration<TourGuideProfile>
    {
        public void Configure(EntityTypeBuilder<TourGuideProfile> builder)
        {
            builder.ToTable("TourGuideProfiles");
            builder.HasKey(e => e.UserId);
            builder.Property(e => e.Bio).HasMaxLength(1000);
            builder.Property(e => e.PricePerDay).HasColumnType("decimal(18,2)");
            builder.Property(e => e.Rating).HasColumnType("decimal(3,2)").HasDefaultValue(0);
            builder.HasCheckConstraint("CK_TourGuideProfile_Rating", "[Rating] >= 0 AND [Rating] <= 5");
            builder.HasOne(e => e.User)
                .WithOne(u => u.TourGuideProfile)
                .HasForeignKey<TourGuideProfile>(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
