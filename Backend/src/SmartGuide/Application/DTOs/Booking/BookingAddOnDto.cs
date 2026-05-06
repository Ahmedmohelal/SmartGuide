namespace Application.DTOs.Booking
{
    public class BookingAddOnDto
    {
        public Guid TourAddOnId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
    }
}
