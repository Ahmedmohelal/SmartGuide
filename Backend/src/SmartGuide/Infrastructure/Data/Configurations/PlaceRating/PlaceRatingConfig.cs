using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using Domain.Entities.PlaceRatings;
using System.Text;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.PlaceRating
{
    public class PlaceRatingConfig : IEntityTypeConfiguration<Domain.Entities.PlaceRatings.PlaceRating>
    {
        public void Configure(EntityTypeBuilder<Domain.Entities.PlaceRatings.PlaceRating> builder)
        {
            builder.HasOne(x => x.Place)
                .WithMany(x => x.Ratings)
                .HasForeignKey(x => x.PlaceId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.UserId, x.PlaceId })
                   .IsUnique();

        }
    }
}
