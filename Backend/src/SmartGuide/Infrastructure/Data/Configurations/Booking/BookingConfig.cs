using Domain.Entities.Book;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Tours;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using Book= Domain.Entities.Book.Booking;

namespace Infrastructure.Data.Configurations.Booking
{
    public class BookingConfig : IEntityTypeConfiguration<Book>
    {
        public void Configure(Microsoft.EntityFrameworkCore.Metadata.Builders.EntityTypeBuilder<Book> builder)
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

            builder.HasIndex(e => new { e.GuideId, e.BookingDate, e.StartTime })
           .HasDatabaseName("IX_Bookings_GuideId_Date_Time");

            builder.HasIndex(e => new { e.TourId, e.BookingDate, e.StartTime })
       .HasDatabaseName("IX_Bookings_TourId_Date_Time");

            builder.HasIndex(e => e.TouristId)
                   .HasDatabaseName("IX_Bookings_TouristId");

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

        }
    }
}
