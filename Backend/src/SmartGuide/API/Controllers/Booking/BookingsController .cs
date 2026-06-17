using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Booking;
using Application.Services.Interfaces.Booking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        public BookingsController(
            IBookingService bookingService)
        {
            _bookingService = bookingService;
        }


        [HttpPost]
        [Authorize(Roles = "Tourist")]

        [ProducesResponseType(
            typeof(BookingResultDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(
            typeof(BookingResultDto),
            StatusCodes.Status400BadRequest)]

        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<BookingResultDto>>
            CreateBookingAsync(
                [FromBody] CreateBookingDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var touristId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var result =
                await _bookingService.CreateBookingAsync(
                    touristId,
                    dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // =========================================================
        // Tourist Bookings
        // =========================================================

        [HttpGet("my-bookings")]
        [Authorize(Roles = "Tourist")]

        [ProducesResponseType(
            typeof(List<BookingDto>),
            StatusCodes.Status200OK)]

        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<List<BookingDto>>>
            GetMyBookingsAsync()
        {
            var touristId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var result =
                await _bookingService
                    .GetTouristBookingsAsync(touristId);

            return Ok(result);
        }

        
        [HttpGet("guide-bookings")]
        [Authorize(Roles = "TourGuide")]

        [ProducesResponseType(
            typeof(List<BookingDto>),
            StatusCodes.Status200OK)]

        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<List<BookingDto>>>
            GetGuideBookingsAsync()
        {
            var guideId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result =
                await _bookingService
                    .GetGuideBookingsAsync(guideId);

            return Ok(result);
        }


        [HttpPatch("{bookingId:guid}/confirm")]
        [Authorize(Roles = "TourGuide")]
        public async Task<ActionResult<OperationResultDto>>
    ConfirmBookingAsync(Guid bookingId)
        {
            var guideId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result =
                await _bookingService
                    .ConfirmBookingAsync(
                        bookingId,
                        guideId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }




        [HttpDelete("{bookingId:guid}")]

        [ProducesResponseType(
            typeof(OperationResultDto),
            StatusCodes.Status200OK)]

        [ProducesResponseType(
            typeof(OperationResultDto),
            StatusCodes.Status400BadRequest)]

        [ProducesResponseType(
            StatusCodes.Status401Unauthorized)]

        public async Task<ActionResult<OperationResultDto>>
            CancelBookingAsync(Guid bookingId)
        {
            var requesterId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(requesterId))
                return Unauthorized();

            var result =
                await _bookingService.CancelBookingAsync(
                    bookingId,
                    requesterId);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}