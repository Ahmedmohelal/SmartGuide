using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.TouristFav
{
    public class SavedTourGuideConfig : IEntityTypeConfiguration<SavedTourGuide>
    {
        public void Configure(EntityTypeBuilder<SavedTourGuide> builder)
        {
            builder.ToTable("FavoriteTourGuides");

            builder.HasKey(x => new { x.TouristUserId, x.TourGuideUserId });

            builder.Property(x => x.TouristUserId)
                .HasMaxLength(450)
                .IsRequired();

            builder.Property(x => x.TourGuideUserId)
                .HasMaxLength(450)
                .IsRequired();

            builder.Property(x => x.CreatedAtUtc)
                .IsRequired();

            builder.HasIndex(x => new { x.TouristUserId, x.CreatedAtUtc });
        }
    }
}
