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
            Guid bookingId,
            string touristId)
        {
            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
                return PaymentIntentResultDto.Failure("Booking not found.");

            if (booking.TouristId != touristId)
                return PaymentIntentResultDto.Failure("Unauthorized.");

            if (booking.PaymentMethod != Domain.Entities.Book.PaymentMethod.Online)
                return PaymentIntentResultDto.Failure("This booking uses cash payment.");

           
            if (booking.Status != BookingStatus.Pending)
            {
                return booking.Status == BookingStatus.Confirmed
                    ? PaymentIntentResultDto.Failure("Booking already paid.")
                    : PaymentIntentResultDto.Failure("Booking is cancelled.");
            }

            if (booking.Slot == null)
                return PaymentIntentResultDto.Failure("Booking slot not found.");

            var slotDateTimeUtc = booking.Slot.Date.ToDateTime(booking.Slot.StartTime);
            if (slotDateTimeUtc <= DateTime.UtcNow)
                return PaymentIntentResultDto.Failure("This tour slot has already passed.");

            if (!string.IsNullOrWhiteSpace(booking.PaymentIntentId))
            {
                try
                {
                    var paymentIntentService = new PaymentIntentService();

                    var existingIntent = await paymentIntentService.GetAsync(
                        booking.PaymentIntentId);

                    if (existingIntent.Status == "requires_payment_method" ||
                        existingIntent.Status == "requires_confirmation" ||
                        existingIntent.Status == "requires_action")
                    {
                        return PaymentIntentResultDto.Success(
                            existingIntent.ClientSecret,
                            _stripeSettings.PublishableKey,
                            booking.TotalPrice);
                    }

                    if (existingIntent.Status == "succeeded")
                    {
                        return PaymentIntentResultDto.Failure(
                            "Booking already paid.");
                    }

                    if (existingIntent.Status == "canceled")
                    {
                        booking.PaymentIntentId = null;
                        await _bookingRepo.SaveChangesAsync();
                    }
                }
                catch (StripeException ex)
                {
                    _logger.LogWarning(
                        ex,
                        "Existing PaymentIntent {PaymentIntentId} not found or invalid.",
                        booking.PaymentIntentId);

                    booking.PaymentIntentId = null;
                    await _bookingRepo.SaveChangesAsync();
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
                intent.Id,
                booking.Id);

            return PaymentIntentResultDto.Success(
                intent.ClientSecret,
                _stripeSettings.PublishableKey,
                booking.TotalPrice);
        }

     
        public async Task<WebhookProcessingResult> HandleWebhookAsync(
            string json,
            string stripeSignature)
        {
            Event stripeEvent;

            try
            {
                stripeEvent = EventUtility.ConstructEvent(
                    json,
                    stripeSignature,
                    _stripeSettings.WebhookSecret,
                    throwOnApiVersionMismatch: false);
            }
            catch (StripeException ex)
            {
                _logger.LogWarning(ex, "Stripe webhook signature validation failed.");
                return WebhookProcessingResult.InvalidSignature;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Malformed Stripe webhook payload.");
                return WebhookProcessingResult.Malformed;
            }

            _logger.LogInformation(
                "Stripe webhook received: {EventType} ({EventId})",
                stripeEvent.Type,
                stripeEvent.Id);

            try
            {
                if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded)
                    return await HandlePaymentSucceededAsync(stripeEvent);

                if (stripeEvent.Type == EventTypes.PaymentIntentPaymentFailed)
                {
                    await HandlePaymentFailedAsync(stripeEvent);
                    return WebhookProcessingResult.Processed;
                }

                return WebhookProcessingResult.Processed;
            }
            catch (Exception ex)
            {
              
                _logger.LogError(
                    ex,
                    "Unexpected error while processing webhook {EventId}.",
                    stripeEvent.Id);

                return WebhookProcessingResult.Processed;
            }
        }

    
        private async Task<WebhookProcessingResult> HandlePaymentSucceededAsync(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;

            if (paymentIntent == null)
            {
                _logger.LogWarning("Webhook payload did not contain a PaymentIntent.");
                return WebhookProcessingResult.Processed;
            }

            if (!paymentIntent.Metadata.TryGetValue("bookingId", out var bookingIdString)
                || !Guid.TryParse(bookingIdString, out var bookingId))
            {
                _logger.LogWarning(
                    "PaymentIntent {Id} is missing a valid bookingId in metadata.",
                    paymentIntent.Id);

                return WebhookProcessingResult.Processed;
            }

            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
            {
                _logger.LogWarning(
                    "Booking {BookingId} not found.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            if (booking.Status == BookingStatus.Confirmed)
            {
                _logger.LogInformation(
                    "Booking {BookingId} already confirmed; skipping duplicate webhook.",
                    bookingId);

                return WebhookProcessingResult.AlreadyProcessed;
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                _logger.LogWarning(
                    "Payment received for cancelled Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            if (booking.PaymentMethod != Domain.Entities.Book.PaymentMethod.Online)
            {
                _logger.LogWarning(
                    "Payment received for non-online Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            if (paymentIntent.Metadata.TryGetValue("touristId", out var metadataTouristId)
                && metadataTouristId != booking.TouristId)
            {
                _logger.LogWarning(
                    "Tourist mismatch for Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            if (booking.PaymentIntentId != paymentIntent.Id)
            {
                _logger.LogWarning(
                    "PaymentIntent mismatch for Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            if (paymentIntent.Status != "succeeded")
            {
                _logger.LogWarning(
                    "Payment not succeeded for Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            var expectedAmount = (long)(booking.TotalPrice * 100);

            if (paymentIntent.AmountReceived != expectedAmount)
            {
                _logger.LogWarning(
                    "Amount mismatch for Booking {BookingId}. Expected {Expected} Received {Received}",
                    bookingId,
                    expectedAmount,
                    paymentIntent.AmountReceived);

                return WebhookProcessingResult.Processed;
            }

            if (!paymentIntent.Currency.Equals(
                    "usd",
                    StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(
                    "Currency mismatch for Booking {BookingId}.",
                    bookingId);

                return WebhookProcessingResult.Processed;
            }

            var confirmationResult = await _bookingRepo.ConfirmBookingAfterPaymentAsync(bookingId);

            switch (confirmationResult)
            {
                case PaymentConfirmationResult.NewlyConfirmed:
                    await _notificationService.SendAsync(
                        booking.TouristId,
                        "Payment Successful 💳",
                        $"Your payment of ${booking.TotalPrice} was confirmed.",
                        NotificationType.PaymentSucceeded,
                        booking.Id.ToString(),
                        "Booking");

                    _logger.LogInformation(
                        "Booking {BookingId} confirmed successfully.",
                        bookingId);

                    return WebhookProcessingResult.Processed;

                case PaymentConfirmationResult.AlreadyConfirmed:
                    return WebhookProcessingResult.AlreadyProcessed;

                case PaymentConfirmationResult.SlotFull:
                    await RefundAndNotifySlotFullAsync(booking, paymentIntent.Id);
                    return WebhookProcessingResult.Processed;

                default:
                    _logger.LogWarning(
                        "Could not confirm Booking {BookingId} after payment.",
                        bookingId);

                    return WebhookProcessingResult.Processed;
            }
        }

        private async Task RefundAndNotifySlotFullAsync(Booking booking, string paymentIntentId)
        {
            try
            {
                var refundService = new RefundService();
                await refundService.CreateAsync(new RefundCreateOptions
                {
                    PaymentIntent = paymentIntentId
                });

                _logger.LogWarning(
                    "Booking {BookingId} could not be honored because the slot filled up after " +
                    "payment succeeded. Refund issued for PaymentIntent {PaymentIntentId}.",
                    booking.Id,
                    paymentIntentId);
            }
            catch (StripeException ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to refund PaymentIntent {PaymentIntentId} for Booking {BookingId} " +
                    "after slot became full. Manual refund required.",
                    paymentIntentId,
                    booking.Id);
            }

            await _notificationService.SendAsync(
                booking.TouristId,
                "Booking Unavailable - Refund Issued",
                $"We're sorry, the slot for your booking filled up just before it could be " +
                $"confirmed. Your payment of ${booking.TotalPrice} has been refunded.",
                NotificationType.PaymentFailed,
                booking.Id.ToString(),
                "Booking");
        }

      
        public async Task<BookingCancellationResult> CancelBookingAndRefundIfNeededAsync(
            Guid bookingId,
            string requesterId)
        {
            var result = await _bookingRepo.CancelBookingAsync(bookingId, requesterId);

            if (!result.Success || !result.RequiresRefund || string.IsNullOrWhiteSpace(result.PaymentIntentId))
                return result;

            try
            {
                var refundService = new RefundService();
                await refundService.CreateAsync(new RefundCreateOptions
                {
                    PaymentIntent = result.PaymentIntentId
                });

                _logger.LogInformation(
                    "Refund issued for cancelled Booking {BookingId}, PaymentIntent {PaymentIntentId}.",
                    bookingId,
                    result.PaymentIntentId);

                await _notificationService.SendAsync(
                    result.TouristId!,
                    "Booking Cancelled - Refund Issued",
                    $"Your booking has been cancelled and your payment of ${result.Amount} has been refunded.",
                    NotificationType.PaymentFailed,
                    bookingId.ToString(),
                    "Booking");
            }
            catch (StripeException ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to refund cancelled Booking {BookingId}, PaymentIntent {PaymentIntentId}. " +
                    "Manual refund required.",
                    bookingId,
                    result.PaymentIntentId);

                await _notificationService.SendAsync(
                    result.TouristId!,
                    "Booking Cancelled",
                    "Your booking has been cancelled. Your refund is being processed and may take a few extra days.",
                    NotificationType.PaymentFailed,
                    bookingId.ToString(),
                    "Booking");
            }

            return result;
        }

    
        public async Task<PaymentConfirmationResult> ConfirmCashBookingAttendanceAsync(
            Guid bookingId,
            string confirmerId)
        {
            var result = await _bookingRepo.ConfirmCashBookingAsync(bookingId, confirmerId);
            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
                return result;

            switch (result)
            {
                case PaymentConfirmationResult.NewlyConfirmed:
                    await _notificationService.SendAsync(
                        booking.TouristId,
                        "Booking Confirmed",
                        "Your guide has confirmed your attendance and your booking is now confirmed.",
                        NotificationType.PaymentSucceeded,
                        booking.Id.ToString(),
                        "Booking");

                    _logger.LogInformation(
                        "Cash Booking {BookingId} confirmed by {ConfirmerId}.",
                        bookingId,
                        confirmerId);
                    break;

                case PaymentConfirmationResult.SlotFull:
                    await _notificationService.SendAsync(
                        booking.TouristId,
                        "Booking Unavailable",
                        "We're sorry, this slot filled up and your booking could not be confirmed.",
                        NotificationType.PaymentFailed,
                        booking.Id.ToString(),
                        "Booking");

                    _logger.LogWarning(
                        "Cash Booking {BookingId} could not be confirmed: slot full.",
                        bookingId);
                    break;

                case PaymentConfirmationResult.Failed:
                    _logger.LogWarning(
                        "Cash Booking {BookingId} confirmation failed (not found, unauthorized, " +
                        "wrong payment method, or invalid state) for confirmer {ConfirmerId}.",
                        bookingId,
                        confirmerId);
                    break;

                case PaymentConfirmationResult.AlreadyConfirmed:
                    // Idempotent - already handled, nothing further to do.
                    break;
            }

            return result;
        }

        private async Task HandlePaymentFailedAsync(Event stripeEvent)
        {
            var paymentIntent = stripeEvent.Data.Object as PaymentIntent;

            if (paymentIntent == null)
                return;

            if (!paymentIntent.Metadata.TryGetValue("bookingId", out var bookingIdString))
                return;

            if (!Guid.TryParse(bookingIdString, out var bookingId))
                return;

            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
                return;

            if (booking.Status != BookingStatus.Pending
                || booking.PaymentMethod != Domain.Entities.Book.PaymentMethod.Online)
                return;

            if (booking.PaymentIntentId != paymentIntent.Id)
                return;

            await _notificationService.SendAsync(
                booking.TouristId,
                "Payment Failed ❌",
                "Your payment could not be processed. Please try again.",
                NotificationType.PaymentFailed,
                booking.Id.ToString(),
                "Booking");

            _logger.LogWarning(
                "Payment failed for Booking {BookingId}.",
                bookingId);
        }
    }
}

