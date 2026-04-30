namespace Application.Services.Interfaces.Booking
{
    public class BookingResultDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
        public Guid? BookingId { get; set; }

        public static BookingResultDto Success(Guid bookingId) =>
            new()
            {
                IsSuccess = true,
                Message = "Booking created successfully.",
                BookingId = bookingId
            };

        public static BookingResultDto Failure(string message) =>
            new()
            {
                IsSuccess = false,
                Message = message
            };
    }
}