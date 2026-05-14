using Application.DTOs.Tour;
using Application.Services.Interfaces.GuideDashboard;
using Application.Services.Interfaces.Tour;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Guide
{
    [Route("api/guide/dashboard")]
    [ApiController]
    [Authorize(Roles = "TourGuide")]
    public class GuideDashboardController : ControllerBase
    {
        private readonly IGuideDashboardService _dashboardService;
        private readonly ITourService _tourService;

        public GuideDashboardController(IGuideDashboardService dashboardService ,
            ITourService tourService)
        {
            _dashboardService = dashboardService;
            _tourService = tourService;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardAsync([FromQuery] int months = 6, [FromQuery] int topTours = 5)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetDashboardAsync(guideId, months, topTours);
            return Ok(result);
        }

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatisticsAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetStatisticsAsync(guideId);
            return Ok(result);
        }

        [HttpGet("documents")]
        public async Task<IActionResult> GetMyDocumentsAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetMyDocumentsAsync(guideId);

            if (result == null)
                return NotFound(new { message = "Guide not found" });

            return Ok(result);
        }

        [HttpGet("earnings")]
        public async Task<IActionResult> GetEarningsTimelineAsync([FromQuery] int months = 12)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetEarningsTimelineAsync(guideId, months);
            return Ok(result);
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetBookingsTimelineAsync([FromQuery] int months = 12)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetBookingsTimelineAsync(guideId, months);
            return Ok(result);
        }

        [HttpGet("tours/performance")]
        public async Task<IActionResult> GetTourPerformanceAsync([FromQuery] int take = 10, [FromQuery] bool mostPopular = true)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetTourPerformanceAsync(guideId, take, mostPopular);
            return Ok(result);
        }

        [HttpGet("wallet")]
        public async Task<IActionResult> GetWalletAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetWalletAsync(guideId);
            return Ok(result);
        }

        [HttpGet("wallet/transactions")]
        public async Task<IActionResult> GetWalletTransactionsAsync([FromQuery] int take = 100)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetWalletTransactionsAsync(guideId, take);
            return Ok(result);
        }

        [HttpGet("activities")]
        public async Task<IActionResult> GetRecentActivitiesAsync([FromQuery] int take = 20)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetRecentActivitiesAsync(guideId, take);
            return Ok(result);
        }

        // From Tour Controller 

        [HttpGet("my-tours")]
        public async Task<IActionResult> GetMyTours()
        {
            var guideId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var tours = await _tourService.GetGuideToursAsync(guideId);

            return Ok(tours);
        }

        [HttpGet("tour/{id:guid}")]
        public async Task<IActionResult> GetTourById(Guid id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);
            if (tour == null)
            {
                return NotFound();
            }
            return Ok(tour);
        }

        [HttpPost("tour/create")]
        public async Task<IActionResult> CreateTourWithImages(
        [FromForm] CreateTourRequestDTO request)
        {
            var userId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return BadRequest("The User Id Is Null");

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var res = await _tourService.CreateTourAsync(request, userId);

            if (!res.IsSucceded)
                return BadRequest(res);

            return Ok(res);
        }

        [HttpGet("tour/by-place/{placeId}")]
        public async Task<IActionResult> GetToursByPlace(int placeId)
        {
            var tours = await _tourService.GetToursByPlaceAsync(placeId);

            if (tours is null || tours.Count == 0)
                return NotFound("There Is No Tour With This Place ");

            return Ok(tours);
        }


        [HttpPut("tour/edit/{id:guid}")]
        public async Task<IActionResult> UpdateTour(
                                                     Guid id,
                                                     [FromForm] CreateTourRequestDTO request)
        {
            var userId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var res = await _tourService.UpdateTourAsync(id, request, userId);

            if (!res.IsSuccess)
                return BadRequest(res);

            return Ok(res);
        }

        [HttpDelete("tour/{id:guid}")]
        public async Task<IActionResult> DeleteTour(Guid id)
        {
            var userId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();
            var res = await _tourService.DeleteTourAsync(id, userId);
            if (!res.IsSuccess)
                return BadRequest(res);
            return Ok(res);

        }
    }

}
