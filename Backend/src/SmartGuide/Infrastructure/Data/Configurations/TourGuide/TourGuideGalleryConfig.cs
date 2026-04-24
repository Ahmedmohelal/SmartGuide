using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Infrastructure.Data.Configurations.TourGuide
{
    public class TourGuideGalleryConfig : IEntityTypeConfiguration<TourGuideGallery>
    {
        public void Configure(EntityTypeBuilder<TourGuideGallery> builder)
        {
            builder.ToTable("TourGuideGalleries");

            builder.HasKey(g => g.Id);

            builder.Property(g => g.ImageUrl)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.HasOne(g => g.TourGuideProfile)
                   .WithMany(p => p.Gallery)
                   .HasForeignKey(g => g.TourGuideProfileId)
                   .OnDelete(DeleteBehavior.Cascade);

        }
    }
}
