using Domain.Entities.Tours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Tours
{
    public class TourAddOnConfiguration : IEntityTypeConfiguration<TourAddOn>
    {
        public void Configure(EntityTypeBuilder<TourAddOn> builder)
        {
            builder.ToTable("TourAddOns");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Title).HasMaxLength(100).IsRequired();
            builder.Property(e => e.Price).HasColumnType("decimal(10,2)").IsRequired();
            builder.Property(e => e.IsActive).IsRequired();
            builder.HasOne(e => e.Tour)
                .WithMany(t => t.TourAddOns)
                .HasForeignKey(e => e.TourId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
