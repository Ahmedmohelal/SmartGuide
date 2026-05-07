namespace Application.Services.Interfaces.Payment
{
    public class PaymentIntentResultDto
    {
        public bool IsSuccess { get; set; }
        public string? ClientSecret { get; set; }
        public string? PublishableKey { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "usd";
        public string? Message { get; set; }

        public static PaymentIntentResultDto Success(
            string clientSecret,
            string publishableKey,
            decimal amount) =>
            new()
            {
                IsSuccess = true,
                ClientSecret = clientSecret,
                PublishableKey = publishableKey,
                Amount = amount,
                Currency = "usd"
            };

        public static PaymentIntentResultDto Failure(string message) =>
            new() { IsSuccess = false, Message = message };
    }
}
