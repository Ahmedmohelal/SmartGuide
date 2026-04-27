using Domain.Entities.Tours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Tours
{
    public class TourStopConfiguration : IEntityTypeConfiguration<TourStops>
    {
        public void Configure(EntityTypeBuilder<TourStops> builder)
        {
            builder.ToTable("TourStops");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.OrderIndex).IsRequired();
            builder.HasIndex(e => new { e.TourId, e.OrderIndex }).IsUnique();
            builder.Property(e => e.Title).HasMaxLength(200);
            builder.Property(e => e.Description).HasMaxLength(500);

            //builder.HasOne(e => e.Tour)
            //    .WithMany(t => t.TourStops)
            //    .HasForeignKey(e => e.TourId)
            //    .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
