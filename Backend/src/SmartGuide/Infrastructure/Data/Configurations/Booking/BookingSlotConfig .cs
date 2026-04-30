using Domain.Entities.Book;
using Domain.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Booking
{
    public class BookingSlotConfig : IEntityTypeConfiguration<BookingSlot>
    {
        public void Configure(EntityTypeBuilder<BookingSlot> builder)
        {
            builder.ToTable("BookingSlots");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.GuideId).IsRequired();

            builder.Property(x => x.Date).IsRequired();

            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.EndTime).IsRequired();

            builder.Property(x => x.Capacity)
        .IsRequired();

            builder.Property(x => x.BookedCount)
                   .HasDefaultValue(0);

            builder.HasIndex(x => new { x.GuideId, x.Date, x.StartTime })
                   .IsUnique();

            builder.HasCheckConstraint(
     "CK_BookingSlot_Time",
     "[EndTime] > [StartTime]");
            builder.HasCheckConstraint(
    "CK_BookingSlot_Capacity",
    "[BookedCount] <= [Capacity]");
            builder.HasIndex(x => new { x.GuideId, x.Date, x.BookedCount });
        }
    }
}
