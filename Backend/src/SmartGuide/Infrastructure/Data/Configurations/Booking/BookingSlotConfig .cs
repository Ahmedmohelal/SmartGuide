using Domain.Entities.Book;
using Domain.Entities.Tours;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Booking
{
    public class BookingSlotConfig : IEntityTypeConfiguration<BookingSlot>
    {
        public void Configure(EntityTypeBuilder<BookingSlot> builder)
        {
            builder.ToTable("BookingSlots");

            builder.HasKey(x => x.Id);

            builder.Property(x => x.GuideId).IsRequired();

            builder.Property(x => x.TourId).IsRequired();

            builder.Property(x => x.Date).IsRequired();

            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.EndTime).IsRequired();

            builder.Property(x => x.Capacity)
        .IsRequired();

            builder.Property(x => x.BookedCount)
                   .HasDefaultValue(0);

            builder.HasIndex(x => x.TourId)
                .HasDatabaseName("IX_BookingSlots_TourId");

            builder.HasIndex(x => new { x.TourId, x.Date, x.StartTime })
                   .IsUnique();

            builder.HasOne(x => x.Tour)
                .WithMany()
                .HasForeignKey(x => x.TourId)
                .OnDelete(DeleteBehavior.Restrict);

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
