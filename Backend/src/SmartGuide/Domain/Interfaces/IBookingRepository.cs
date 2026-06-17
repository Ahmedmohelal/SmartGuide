using Domain.Entities.Book;

public interface IBookingRepository
{
    Task AddSlotAsync(BookingSlot slot);

    Task<Booking> CreateBookingAsync(Booking booking);

    Task<BookingCancellationResult> CancelBookingAsync(Guid bookingId, string requesterId);

    Task<PaymentConfirmationResult> ConfirmBookingAfterPaymentAsync(Guid bookingId);

    Task<PaymentConfirmationResult> ConfirmCashBookingAsync(Guid bookingId, string confirmerId);

    Task<Booking?> GetBookingByIdAsync(Guid bookingId);

    Task<List<Booking>> GetGuideBookingsAsync(string guideId);

    Task<List<Booking>> GetTouristBookingsAsync(string touristId);

    Task<List<BookingSlot>> GetSlotsByTourAndDateAsync(Guid tourId, DateOnly date);

    Task<BookingSlot?> GetSlotByIdAsync(Guid slotId);

    Task<bool> TryIncrementBookedCountAsync(Guid slotId);

    Task<bool> IsSlotAvailableAsync(Guid slotId);

    Task SaveChangesAsync();
}
