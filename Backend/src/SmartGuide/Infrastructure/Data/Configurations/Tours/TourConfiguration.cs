using Domain.Entities.Tours;
using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Tours
{
    public class TourConfiguration : IEntityTypeConfiguration<Tour>
    {
        public void Configure(EntityTypeBuilder<Tour> builder)
        {
            builder.ToTable("Tours");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title)
                .HasMaxLength(500)
                .IsRequired();

            builder.Property(e => e.Description)
                .HasMaxLength(4000)
                .IsRequired();

            builder.Property(e => e.Price)
                .HasColumnType("decimal(18,2)");

            builder.Property(e => e.GuideId)
                .IsRequired();

            // العلاقة مع المرشد
            builder.HasOne<TourGuideProfile>()
                   .WithMany()
                   .HasForeignKey(e => e.GuideId)
                   .HasPrincipalKey(p => p.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(e => e.GuideId);

            // العلاقات مع الـ children — هنا بس مش في كل Configuration
            builder.HasMany(e => e.TourImages)
                   .WithOne(i => i.Tour)
                   .HasForeignKey(i => i.TourId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.TourStops)
                   .WithOne(s => s.Tour)
                   .HasForeignKey(s => s.TourId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.TourInclusions)
                   .WithOne(i => i.Tour)
                   .HasForeignKey(i => i.TourId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.TourAddOns)
                   .WithOne(a => a.Tour)
                   .HasForeignKey(a => a.TourId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(b => b.Bookings)
                   .WithOne(t => t.Tour)
                   .HasForeignKey(b => b.TourId);
        }
    }
}