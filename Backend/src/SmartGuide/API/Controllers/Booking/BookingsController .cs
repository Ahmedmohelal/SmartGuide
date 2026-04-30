using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Booking
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> CreateBookingAsync(
            [FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var touristId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var result = await _bookingService
                .CreateBookingAsync(touristId, dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet("my-bookings")]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> GetMyBookingsAsync()
        {
            var touristId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var result = await _bookingService
                .GetTouristBookingsAsync(touristId);

            return Ok(result);
        }

        [HttpGet("guide-bookings")]
        [Authorize(Roles = "TourGuide")]
        public async Task<IActionResult> GetGuideBookingsAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _bookingService
                .GetGuideBookingsAsync(guideId);

            return Ok(result);
        }

        [HttpDelete("{bookingId}")]
        public async Task<IActionResult> CancelBookingAsync(Guid bookingId)
        {
            var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(requesterId))
                return Unauthorized();

            var result = await _bookingService
                .CancelBookingAsync(bookingId, requesterId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}
