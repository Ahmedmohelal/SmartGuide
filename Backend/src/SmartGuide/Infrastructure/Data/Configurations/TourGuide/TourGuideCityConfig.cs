using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.TourGuide
{
    public class TourGuideCityConfig : IEntityTypeConfiguration<TourGuideCity>
    {
        public void Configure(EntityTypeBuilder<TourGuideCity> builder)
        {
             builder.ToTable("TourGuideCities");

            builder.HasKey(c => c.Id);

            builder.Property(c => c.CityName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.HasOne(c => c.TourGuideProfile)
                   .WithMany(p => p.Cities)
                   .HasForeignKey(c => c.TourGuideProfileId)
                   .OnDelete(DeleteBehavior.Cascade); 


        }
    }
}
