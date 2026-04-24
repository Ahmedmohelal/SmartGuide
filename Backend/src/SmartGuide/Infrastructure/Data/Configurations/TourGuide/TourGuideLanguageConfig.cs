using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.TourGuide
{
    public class TourGuideLanguageConfig : IEntityTypeConfiguration<TourGuideLanguage>
    {
        public void Configure(EntityTypeBuilder<TourGuideLanguage> builder)
        {
            builder.ToTable("TourGuideLanguages");

            builder.HasKey(e => e.Id); 

            builder.Property(e => e.Language)
                   .HasMaxLength(50)
                   .IsRequired();

            builder.HasOne(e => e.TourGuideProfile)
                   .WithMany(p => p.Languages)
                   .HasForeignKey(e => e.TourGuideProfileId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}