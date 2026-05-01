namespace Application.Services.Interfaces.Booking
{
    public class BookingDto
    {
        public Guid Id { get; set; }


        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; }
        public BookingSlotInfoDto Slot { get; set; } = null!;
    }
}