using Domain.Entities.Book;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;

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


        public async Task<Booking> CreateBookingAsync(Booking booking)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);

                try
                {
                    if (!await IsSlotAvailableAsync(booking.SlotId))
                        throw new InvalidOperationException("Slot is no longer available.");

                    await _context.Bookings.AddAsync(booking);
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


        public async Task<BookingCancellationResult> CancelBookingAsync(Guid bookingId, string requesterId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);

                try
                {
                    var user = await _context.Users.FindAsync(requesterId);
                    if (user == null)
                        return BookingCancellationResult.Fail("Requester not found.");

                    var booking = await _context.Bookings
                        .FirstOrDefaultAsync(b => b.Id == bookingId
                            && (b.TouristId == requesterId
                                || b.GuideId == requesterId
                                || user.Role == "Admin"));

                    if (booking == null)
                        return BookingCancellationResult.Fail("Booking not found or not authorized.");

                    if (booking.Status == BookingStatus.Cancelled)
                        return BookingCancellationResult.Fail("Booking already cancelled.");

                    var seatWasReserved = booking.Status == BookingStatus.Confirmed;

                    var requiresRefund = seatWasReserved
                        && booking.PaymentMethod == PaymentMethod.Online
                        && !string.IsNullOrWhiteSpace(booking.PaymentIntentId);

                    booking.Status = BookingStatus.Cancelled;

                    if (seatWasReserved)
                    {
                        var slot = await _context.BookingsSlot
                            .FirstOrDefaultAsync(s => s.Id == booking.SlotId);

                        if (slot != null && slot.BookedCount > 0)
                            slot.BookedCount--;
                    }

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return BookingCancellationResult.Ok(
                        requiresRefund,
                        booking.PaymentIntentId,
                        booking.TotalPrice,
                        booking.TouristId);
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }


        public async Task<PaymentConfirmationResult> ConfirmBookingAfterPaymentAsync(Guid bookingId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);

                try
                {
                    var booking = await _context.Bookings
                        .FirstOrDefaultAsync(b => b.Id == bookingId);

                    if (booking == null)
                        return PaymentConfirmationResult.Failed;

                    if (booking.Status == BookingStatus.Confirmed)
                        return PaymentConfirmationResult.AlreadyConfirmed;

                    if (booking.Status == BookingStatus.Cancelled)
                        return PaymentConfirmationResult.Failed;

                    if (booking.PaymentMethod != PaymentMethod.Online)
                        return PaymentConfirmationResult.Failed;

                    var slot = await _context.BookingsSlot
                        .FirstOrDefaultAsync(s => s.Id == booking.SlotId);

                    if (slot == null || !IsSlotTimeValid(slot))
                        return PaymentConfirmationResult.Failed;

                    if (!await TryIncrementBookedCountAsync(booking.SlotId))
                    {

                        booking.Status = BookingStatus.Cancelled;
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return PaymentConfirmationResult.SlotFull;
                    }

                    booking.Status = BookingStatus.Confirmed;
                    booking.ConfirmedAtUtc = DateTime.UtcNow;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return PaymentConfirmationResult.NewlyConfirmed;
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }


        public async Task<PaymentConfirmationResult> ConfirmCashBookingAsync(Guid bookingId, string confirmerId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction = await _context.Database
                    .BeginTransactionAsync(IsolationLevel.Serializable);

                try
                {
                    var user = await _context.Users.FindAsync(confirmerId);
                    if (user == null)
                        return PaymentConfirmationResult.Failed;

                    var booking = await _context.Bookings
                        .FirstOrDefaultAsync(b => b.Id == bookingId
                            && (b.GuideId == confirmerId || user.Role == "Admin"));

                    if (booking == null)
                        return PaymentConfirmationResult.Failed;

                    if (booking.Status == BookingStatus.Confirmed)
                        return PaymentConfirmationResult.AlreadyConfirmed;

                    if (booking.Status == BookingStatus.Cancelled)
                        return PaymentConfirmationResult.Failed;

                    if (booking.PaymentMethod != PaymentMethod.Cash)
                        return PaymentConfirmationResult.Failed;

                    var slot = await _context.BookingsSlot
                        .FirstOrDefaultAsync(s => s.Id == booking.SlotId);

                    if (slot == null)
                        return PaymentConfirmationResult.Failed;

                    if (!await TryIncrementBookedCountAsync(booking.SlotId))
                    {
                        booking.Status = BookingStatus.Cancelled;
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return PaymentConfirmationResult.SlotFull;
                    }

                    booking.Status = BookingStatus.Confirmed;

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();
                    return PaymentConfirmationResult.NewlyConfirmed;
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
            return _context.BookingsSlot.FirstOrDefaultAsync(s => s.Id == slotId);
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

        public async Task<bool> TryIncrementBookedCountAsync(Guid slotId)
        {
            var rowsAffected = await _context.BookingsSlot
                .Where(s => s.Id == slotId && s.BookedCount < s.Capacity)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(x => x.BookedCount, x => x.BookedCount + 1));

            return rowsAffected > 0;
        }


        public async Task<bool> IsSlotAvailableAsync(Guid slotId)
        {
            var slot = await _context.BookingsSlot.FirstOrDefaultAsync(s => s.Id == slotId);
            if (slot == null || !IsSlotTimeValid(slot))
                return false;

            return slot.BookedCount < slot.Capacity;
        }

        public async Task UpdateAsync(Booking booking)
        {
            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }



        private static bool IsSlotTimeValid(BookingSlot slot)
        {
            return slot.Date.ToDateTime(slot.StartTime) > DateTime.UtcNow;
        }


    }
}
