namespace Application.Services.Interfaces.Payment
{
    public interface IPaymentService
    {
        Task<PaymentIntentResultDto> CreatePaymentIntentAsync(
            Guid bookingId, string touristId);
        Task<bool> HandleWebhookAsync(
            string json, string stripeSignature);
    }
}
