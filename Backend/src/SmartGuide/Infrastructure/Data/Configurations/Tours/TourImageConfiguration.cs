using Domain.Entities.Tours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Tours
{
    public class TourImageConfiguration : IEntityTypeConfiguration<TourImage>
    {
        public void Configure(EntityTypeBuilder<TourImage> builder)
        {
            builder.ToTable("TourImages");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.ImageUrl)
                   .HasMaxLength(500)
                   .IsRequired();

            builder.Property(e => e.IsPrimary)
                   .IsRequired();

            builder.Property(e => e.OrderIndex)
                   .IsRequired();

            builder.HasOne(e => e.Tour) 
                   .WithMany(t => t.TourImages)
                   .HasForeignKey(e => e.TourId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(e => e.TourId)
                   .IsUnique()
                   .HasFilter("[IsPrimary] = 1");
        }
    }
}
