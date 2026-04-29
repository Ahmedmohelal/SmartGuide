using Domain.Entities.Book;

public interface IBookingRepository
{
    // Slots
    Task AddSlotAsync(BookingSlot slot);
    Task<BookingSlot?> GetSlotByIdAsync(Guid slotId);
    Task<List<BookingSlot>> GetGuideSlotsByDateAsync(string guideId, DateOnly date);
    Task<bool> IsSlotAvailableAsync(Guid slotId);
    Task IncrementBookedCountAsync(Guid slotId);

    // Bookings
    Task<Booking> CreateBookingAsync(Booking booking);
    Task<Booking?> GetBookingByIdAsync(Guid bookingId);
    Task<List<Booking>> GetTouristBookingsAsync(string touristId);
    Task<List<Booking>> GetGuideBookingsAsync(string guideId);
    Task<bool> CancelBookingAsync(Guid bookingId, string requesterId);


    Task SaveChangesAsync();
}