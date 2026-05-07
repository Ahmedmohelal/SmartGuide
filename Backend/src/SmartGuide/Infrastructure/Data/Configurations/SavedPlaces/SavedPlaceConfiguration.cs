using Domain.Entities.SavedPlaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations
{
    public class SavedPlaceConfiguration : IEntityTypeConfiguration<SavedPlace>
    {
        public void Configure(EntityTypeBuilder<SavedPlace> builder)
        {
            builder.HasKey(x => x.Id);

            builder.HasIndex(x => new
            {
                x.TouristUserId,
                x.PlaceId
            }).IsUnique();

            builder.Property(x => x.TouristUserId)
                .IsRequired();

            builder.Property(x => x.CreatedAtUtc)
                .IsRequired();

            builder.HasOne(x => x.Place)
                .WithMany(x => x.SavedByTourists)
                .HasForeignKey(x => x.PlaceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Tourist)
                .WithMany(x => x.SavedPlaces)
                .HasForeignKey(x => x.TouristUserId)
                .HasPrincipalKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}