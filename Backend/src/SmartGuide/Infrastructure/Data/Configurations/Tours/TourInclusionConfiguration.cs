using Domain.Entities.Tours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Tours
{
    public class TourInclusionConfiguration : IEntityTypeConfiguration<TourInclusion>
    {
        public void Configure(EntityTypeBuilder<TourInclusion> builder)
        {
            builder.ToTable("TourInclusions");
            builder.HasKey(e => e.Id);

            builder.Property(e => e.Description).HasMaxLength(1000);

            builder.Property(e => e.Type)
                .HasColumnName("Type")
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.HasOne(e => e.Tour)
                .WithMany(t => t.TourInclusions)
                .HasForeignKey(e => e.TourId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
