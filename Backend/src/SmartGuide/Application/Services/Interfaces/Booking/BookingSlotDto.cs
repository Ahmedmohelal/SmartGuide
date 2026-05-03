namespace Application.Services.Interfaces.Booking
{
    public class BookingSlotDto
    {
        public Guid Id { get; set; }
        public Guid TourId { get; set; }
        public DateOnly Date { get; set; }
        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }
        public int Capacity { get; set; }
        public int BookedCount { get; set; }
        public bool IsFull { get; set; }
        public int RemainingSpots => Capacity - BookedCount;
    }
}