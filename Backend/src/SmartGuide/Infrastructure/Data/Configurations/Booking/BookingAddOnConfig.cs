using Domain.Entities.Book;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Booking
{
    public class BookingAddOnConfig : IEntityTypeConfiguration<BookingAddOn>
    {
        public void Configure(EntityTypeBuilder<BookingAddOn> builder)
        {
            builder.ToTable("BookingAddOns");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Price).HasColumnType("decimal(10,2)");

            builder.HasOne(e => e.Booking)
                   .WithMany(b => b.SelectedAddOns)
                   .HasForeignKey(e => e.BookingId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(e => e.TourAddOn)
                   .WithMany()
                   .HasForeignKey(e => e.TourAddOnId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
