using Domain.Entities.Book;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Text;

namespace Infrastructure.Repository.Book
{
    public class BookingRepository : IBookingRepository
    {
        private readonly ApplicationDbContext _context;

        public BookingRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddSlotAsync(BookingSlot slot)
        {
            await _context.BookingsSlot.AddAsync(slot);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> CancelBookingAsync(Guid bookingId, string requesterId)
        {
            var booking = await _context.Bookings
                       .FirstOrDefaultAsync(b => b.Id == bookingId
                           && (b.TouristId == requesterId
                           || b.GuideId == requesterId));
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
    
        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);

                try
                {
                    var isAvailable = await IsSlotAvailableAsync(booking.SlotId);
                    if (!isAvailable)
                        throw new InvalidOperationException("Slot is no longer available.");

                    await _context.Bookings.AddAsync(booking);

                    await IncrementBookedCountAsync(booking.SlotId);

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return booking;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        public async Task<Booking?> GetBookingByIdAsync(Guid bookingId)
        {
            return await _context.Bookings
                .Include(b => b.Slot)
                .Include(b => b.SelectedAddOns)
                    .ThenInclude(a => a.TourAddOn)
                .FirstOrDefaultAsync(b => b.Id == bookingId);
        }

        public async Task<List<Booking>> GetGuideBookingsAsync(string guideId)
        {
            return await _context.Bookings
                .Where(b => b.GuideId == guideId)
                .Include(b => b.Slot)
                .Include(b => b.SelectedAddOns)
                    .ThenInclude(a => a.TourAddOn)
                .OrderByDescending(b => b.CreatedAtUtc)
                .ToListAsync();
        }

        public async Task<List<BookingSlot>> GetSlotsByTourAndDateAsync(Guid tourId, DateOnly date)
        {
            return await _context.BookingsSlot
                .Where(s => s.TourId == tourId && s.Date == date)
                .OrderBy(s => s.StartTime)
                .ToListAsync();
        }

        public Task<BookingSlot?> GetSlotByIdAsync(Guid slotId)
        {
            var slot = _context.BookingsSlot.FirstOrDefaultAsync(s => s.Id == slotId);
            return slot;
        }

        public async Task<List<Booking>> GetTouristBookingsAsync(string touristId)
        {
            return await _context.Bookings
            .Where(b => b.TouristId == touristId)
            .Include(b => b.Slot)
            .Include(b => b.SelectedAddOns)
                .ThenInclude(a => a.TourAddOn)
            .OrderByDescending(b => b.CreatedAtUtc)
            .ToListAsync();
        }

        public async Task IncrementBookedCountAsync(Guid slotId)
        {
            await _context.BookingsSlot
            .Where(s => s.Id == slotId)
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.BookedCount, x => x.BookedCount + 1));
        }


        public async Task<bool> IsSlotAvailableAsync(Guid slotId)
        {
            var slot = await _context.BookingsSlot.FirstOrDefaultAsync(s => s.Id == slotId);
            return slot != null && slot.BookedCount < slot.Capacity;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
