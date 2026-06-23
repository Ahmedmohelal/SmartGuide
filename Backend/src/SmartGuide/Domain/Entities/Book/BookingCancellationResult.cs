
namespace Domain.Entities.Book
{
    public class BookingCancellationResult
    {
        public bool Success { get; private init; }
        public string? FailureReason { get; private init; }


        public bool RequiresRefund { get; private init; }

        public string? PaymentIntentId { get; private init; }
        public decimal Amount { get; private init; }
        public string? TouristId { get; private init; }

        public static BookingCancellationResult Fail(string reason) =>
            new() { Success = false, FailureReason = reason };

        public static BookingCancellationResult Ok(
            bool requiresRefund,
            string? paymentIntentId,
            decimal amount,
            string touristId) =>
            new()
            {
                Success = true,
                RequiresRefund = requiresRefund,
                PaymentIntentId = paymentIntentId,
                Amount = amount,
                TouristId = touristId
            };
    }
}
