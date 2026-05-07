using Application.Services.Interfaces.Payment;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Payment
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create-intent")]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> CreatePaymentIntentAsync(
            [FromBody] CreatePaymentIntentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var touristId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var result = await _paymentService
                .CreatePaymentIntentAsync(dto.BookingId, touristId);

            if (!result.IsSuccess)
                return BadRequest(new { message = result.Message });

            return Ok(result);
        }

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> WebhookAsync()
        {
            string json;
            using (var reader = new StreamReader(HttpContext.Request.Body))
            {
                json = await reader.ReadToEndAsync();
            }

            var stripeSignature = Request.Headers["Stripe-Signature"].ToString();

            if (string.IsNullOrWhiteSpace(stripeSignature))
                return BadRequest(new { message = "Missing Stripe-Signature header." });

            var success = await _paymentService
                .HandleWebhookAsync(json, stripeSignature);

            if (!success)
                return BadRequest(new { message = "Webhook handling failed." });

            return Ok();
        }
    }
}
