using Application.Services.Interfaces.Notifications;
using Application.Services.Interfaces.Payment;
using Domain.Entities.Book;
using Domain.Entities.Notifications;
using Domain.Interfaces;
using Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Stripe;

namespace Infrastructure.Services.Payment
{
    public class PaymentService : IPaymentService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly StripeSettings _stripeSettings;
        private readonly ILogger<PaymentService> _logger;
        private readonly INotificationService _notificationService;

        public PaymentService(
            IBookingRepository bookingRepo,
            IOptions<StripeSettings> stripeOptions,
            ILogger<PaymentService> logger,
            INotificationService notificationService)
        {
            _bookingRepo = bookingRepo;
            _stripeSettings = stripeOptions.Value;
            _logger = logger;
            _notificationService = notificationService;
            StripeConfiguration.ApiKey = _stripeSettings.SecretKey;
        }

        public async Task<PaymentIntentResultDto> CreatePaymentIntentAsync(
            Guid bookingId, string touristId)
        {
            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
                return PaymentIntentResultDto.Failure("Booking not found.");

            if (booking.TouristId != touristId)
                return PaymentIntentResultDto.Failure("Unauthorized.");

            if (booking.PaymentMethod != Domain.Entities.Book.PaymentMethod.Online)
                return PaymentIntentResultDto.Failure(
                    "This booking uses cash payment.");

            if (booking.Status == BookingStatus.Confirmed)
                return PaymentIntentResultDto.Failure(
                    "Booking already paid.");

            if (booking.Status == BookingStatus.Cancelled)
                return PaymentIntentResultDto.Failure(
                    "Booking is cancelled.");

            if (!string.IsNullOrWhiteSpace(booking.PaymentIntentId))
            {
                var existingService = new PaymentIntentService();
                var existingIntent = await existingService
                    .GetAsync(booking.PaymentIntentId);

                if (existingIntent.Status == "requires_payment_method" ||
                    existingIntent.Status == "requires_confirmation" ||
                    existingIntent.Status == "requires_action")
                {
                    return PaymentIntentResultDto.Success(
                        existingIntent.ClientSecret,
                        _stripeSettings.PublishableKey,
                        booking.TotalPrice);
                }
            }

            var amountInCents = (long)(booking.TotalPrice * 100);

            var options = new PaymentIntentCreateOptions
            {
                Amount = amountInCents,
                Currency = "usd",
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                },
                Metadata = new Dictionary<string, string>
                {
                    { "bookingId", booking.Id.ToString() },
                    { "touristId", touristId },
                    { "tourId", booking.TourId.ToString() }
                }
            };

            var service = new PaymentIntentService();
            var intent = await service.CreateAsync(options);

            booking.PaymentIntentId = intent.Id;
            await _bookingRepo.SaveChangesAsync();

            _logger.LogInformation(
                "PaymentIntent {IntentId} created for Booking {BookingId}",
                intent.Id, bookingId);

            return PaymentIntentResultDto.Success(
                intent.ClientSecret,
                _stripeSettings.PublishableKey,
                booking.TotalPrice);
        }

        public async Task<bool> HandleWebhookAsync(
            string json, string stripeSignature)
        {
            try
            {
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    _stripeSettings.WebhookSecret,
                    throwOnApiVersionMismatch: false);

                _logger.LogInformation(
                    "Stripe webhook received: {EventType}", stripeEvent.Type);

                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent == null) return false;

                    if (!paymentIntent.Metadata.TryGetValue(
                        "bookingId", out var bookingIdStr))
                        return false;

                    if (!Guid.TryParse(bookingIdStr, out var bookingId))
                        return false;

                    var booking = await _bookingRepo
                        .GetBookingByIdAsync(bookingId);

                    if (booking == null)
                    {
                        _logger.LogWarning(
                            "Booking {BookingId} not found for webhook.", bookingId);
                        return false;
                    }

                    booking.Status = BookingStatus.Confirmed;
                    await _bookingRepo.SaveChangesAsync();

                    await _notificationService.SendAsync(
                        booking.TouristId,
                        "Payment Successful 💳",
                        $"Your payment of ${booking.TotalPrice} was confirmed.",
                        NotificationType.PaymentSucceeded,
                        booking.Id.ToString(), "Booking");

                    _logger.LogInformation(
                        "Booking {BookingId} confirmed after successful payment.",
                        bookingId);
                }
                else if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
                {
                    var paymentIntent = stripeEvent.Data.Object as PaymentIntent;
                    if (paymentIntent == null) return true;

                    if (!paymentIntent.Metadata.TryGetValue(
                        "bookingId", out var bookingIdStr))
                        return true;

                    if (!Guid.TryParse(bookingIdStr, out var failedBookingId))
                        return true;

                    var failedBooking = await _bookingRepo.GetBookingByIdAsync(failedBookingId);
                    if (failedBooking is not null)
                    {
                        await _notificationService.SendAsync(
                            failedBooking.TouristId,
                            "Payment Failed ❌",
                            "Your payment could not be processed. Please try again.",
                            NotificationType.PaymentFailed,
                            failedBookingId.ToString(), "Booking");
                    }

                    _logger.LogWarning(
                        "Payment failed for Booking {BookingId}.", failedBookingId);
                }

                return true;
            }
            catch (StripeException ex)
            {
                _logger.LogError(ex, "Stripe webhook validation error.");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error handling Stripe webhook.");
                return false;
            }
        }
    }
}
