using Domain.Entities.Book;

namespace Application.Services.Interfaces.Payment
{
    public interface IPaymentService
    {
        Task<PaymentIntentResultDto> CreatePaymentIntentAsync(Guid bookingId, string touristId);

        Task<WebhookProcessingResult> HandleWebhookAsync(string json, string stripeSignature);

        Task<BookingCancellationResult> CancelBookingAndRefundIfNeededAsync(Guid bookingId, string requesterId);

        Task<PaymentConfirmationResult> ConfirmCashBookingAttendanceAsync(Guid bookingId, string confirmerId);
    }
}
