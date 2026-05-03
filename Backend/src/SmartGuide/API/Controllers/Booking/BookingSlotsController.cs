using Application.Services.Interfaces.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Booking
{
    [Route("api/tours")]
    [ApiController]
    [Authorize]
    public class BookingSlotsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingSlotsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost("slots")]
        [Authorize(Roles = "TourGuide")]
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

        [HttpGet("{tourId:guid}/slots")]
        [Authorize(Roles = "Tourist,TourGuide")]
        public async Task<IActionResult> GetSlotsByTourAsync(
            Guid tourId,
            [FromQuery] DateOnly date)
        {
            var result = await _bookingService.GetSlotsByTourAndDateAsync(tourId, date);
            return Ok(result);
        }
    }
}
