using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Domain.Entities.Book;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public class BookingAdminService : IBookingAdminService
    {
        private readonly ApplicationDbContext _context;

        public BookingAdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<AdminBookingDto>> GetAllBookingsAsync(
         string? status = null, string? guideId = null)
        {
            var query = _context.Bookings
                .AsNoTracking()
                .Include(b => b.Slot)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
            {
                query = query.Where(b => b.Status == bookingStatus);
            }

            if (!string.IsNullOrWhiteSpace(guideId))
            {
                query = query.Where(b => b.GuideId == guideId);
            }

            var bookings = await query.ToListAsync();

            var userIds = bookings.Select(b => b.TouristId)
                .Concat(bookings.Select(b => b.GuideId))
                .Distinct()
                .ToList();

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var tourIds = bookings.Select(b => b.TourId).Distinct().ToList();
            var tours = await _context.Tours
                .AsNoTracking()
                .Where(t => tourIds.Contains(t.Id))
                .ToDictionaryAsync(t => t.Id);

            return bookings.Select(b =>
            {
                users.TryGetValue(b.TouristId, out var tourist);
                users.TryGetValue(b.GuideId, out var guide);
                tours.TryGetValue(b.TourId, out var tour);

                return new AdminBookingDto
                {
                    Id = b.Id,
                    TouristId = b.TouristId,
                    TouristName = tourist != null
                        ? $"{tourist.FirstName} {tourist.LastName}"
                        : "Unknown",
                    TouristEmail = tourist?.Email ?? string.Empty,
                    GuideId = b.GuideId,
                    GuideName = guide != null
                        ? $"{guide.FirstName} {guide.LastName}"
                        : "Unknown",
                    TourId = b.TourId,
                    TourTitle = tour?.Title ?? "Unknown",
                    Status = b.Status.ToString(),
                    TotalPrice = b.TotalPrice,
                    PaymentMethod = b.PaymentMethod.ToString(),
                    CreatedAtUtc = b.CreatedAtUtc,
                    SlotDate = b.Slot.Date,
                    SlotStartTime = b.Slot.StartTime,
                    SlotEndTime = b.Slot.EndTime
                };
            }).ToList();
        }

        public async Task<bool> CancelBookingAsync(Guid bookingId, string requesterId)
        {
            var user = await _context.Users.FindAsync(requesterId);
            if (user == null) return false;
            var booking = await _context.Bookings
                       .FirstOrDefaultAsync(b => b.Id == bookingId
                           && (b.TouristId == requesterId
                           || b.GuideId == requesterId
                           || user.Role == "Admin"));
            if (booking == null) return false;

            if (booking.Status == BookingStatus.Cancelled) return false;

            booking.Status = BookingStatus.Cancelled;

            await _context.SaveChangesAsync();

            await _context.BookingsSlot
                .Where(s => s.Id == booking.SlotId && s.BookedCount > 0)
                .ExecuteUpdateAsync(s => s.SetProperty(
                       x => x.BookedCount, x => x.BookedCount - 1));

            await _context.SaveChangesAsync();
            return true;
        }

    }
}
