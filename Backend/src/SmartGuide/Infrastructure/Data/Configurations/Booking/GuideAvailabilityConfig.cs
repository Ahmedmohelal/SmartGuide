using Domain.Entities.Book;
using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Booking
{
    public class GuideAvailabilityConfig : IEntityTypeConfiguration<GuideAvailability>
    {
        public void Configure(EntityTypeBuilder<GuideAvailability> builder)
        {
            builder.ToTable("GuideAvailabilities");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.GuideId)
                   .IsRequired();

            builder.Property(e => e.Date)
                   .IsRequired();

            builder.Property(e => e.StartTime)
                   .IsRequired();

            builder.Property(e => e.EndTime)
                   .IsRequired();

            builder.Property(e => e.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.HasCheckConstraint(
                "CK_GuideAvailability_Times",
                "[EndTime] > [StartTime]");

            builder.HasIndex(e => new { e.GuideId, e.Date })
                   .HasDatabaseName("IX_GuideAvailabilities_GuideId_Date");

            builder.HasOne<TourGuideProfile>()
                   .WithMany()
                   .HasForeignKey(e => e.GuideId)
                   .HasPrincipalKey(p => p.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
