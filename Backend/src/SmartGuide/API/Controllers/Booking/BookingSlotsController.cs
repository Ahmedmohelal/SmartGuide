using Application.DTOs;
using Application.Services.Interfaces.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Booking
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "TourGuide")]
    public class BookingSlotsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingSlotsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<IActionResult> AddSlotAsync(
            [FromBody] CreateBookingSlotDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _bookingService.AddSlotAsync(guideId, dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetMySlotsByDateAsync(
            [FromQuery] DateOnly date)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _bookingService
                .GetGuideSlotsByDateAsync(guideId, date);

            return Ok(result);
        }
    }
}
