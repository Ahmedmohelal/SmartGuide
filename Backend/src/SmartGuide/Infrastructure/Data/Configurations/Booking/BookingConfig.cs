using Domain.Entities.Book;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Tours;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Book = Domain.Entities.Book.Booking;

namespace Infrastructure.Data.Configurations.Booking
{
    public class BookingConfig : IEntityTypeConfiguration<Book>
    {
        public void Configure(EntityTypeBuilder<Book> builder)
        {
            builder.ToTable("Bookings");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.TouristId)
                   .IsRequired();

            builder.Property(e => e.GuideId)
                   .IsRequired();

            builder.Property(e => e.TourId)
                   .IsRequired();


            builder.Property(e => e.BookingDate)
                   .IsRequired();
          
            builder.Property(e => e.StartTime)
                   .IsRequired();

            builder.Property(e => e.EndTime) 
                   .IsRequired();

            builder.Property(e => e.TotalPrice)
                   .HasColumnType("decimal(10,2)")
                   .IsRequired();

            builder.Property(e => e.Status)
                   .HasConversion<string>() 
                   .HasMaxLength(20)
                   .IsRequired();

            builder.Property(e => e.PaymentMethod)
                   .HasConversion<string>()
                   .HasMaxLength(20)
                   .IsRequired();

          

            builder.HasIndex(e => new { e.GuideId, e.BookingDate })
                   .HasDatabaseName("IX_Bookings_GuideId_Date");

            builder.HasIndex(e => e.TouristId)
                   .HasDatabaseName("IX_Bookings_TouristId");

            builder.HasIndex(e => e.TourId)
                   .HasDatabaseName("IX_Bookings_TourId");


            builder.HasOne<Tour>()
                   .WithMany()
                   .HasForeignKey(e => e.TourId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<TourGuideProfile>()
                   .WithMany()
                   .HasForeignKey(e => e.GuideId)
                   .HasPrincipalKey(p => p.UserId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ApplicationUser>()
                   .WithMany()
                   .HasForeignKey(e => e.TouristId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.Property(e => e.SlotId)
       .IsRequired();

            builder.HasIndex(e => e.SlotId)
                   .HasDatabaseName("IX_Bookings_SlotId");

            builder.HasOne(e => e.Slot)        
         .WithMany() 
         .HasForeignKey(e => e.SlotId)
         .OnDelete(DeleteBehavior.Restrict);

        }
    }
}