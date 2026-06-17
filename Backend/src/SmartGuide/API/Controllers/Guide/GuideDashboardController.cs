using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.GuideDashboard;
using Application.DTOs.Tour;
using Application.Services.Interfaces.GuideDashboard;
using Application.Services.Interfaces.Tour;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        public GuideDashboardController(
            IGuideDashboardService dashboardService,
            ITourService tourService)
        {
            _dashboardService = dashboardService;
            _tourService = tourService;
        }

        [HttpGet]
        public async Task<ActionResult<GuideDashboardResponseDto>> GetDashboardAsync(
            [FromQuery] int months = 6,
            [FromQuery] int topTours = 5)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetDashboardAsync(guideId, months, topTours);

            return Ok(result);
        }

        [HttpGet("statistics")]
        [ProducesResponseType(typeof(GuideDashboardStatisticsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<GuideDashboardStatisticsDto>> GetStatisticsAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetStatisticsAsync(guideId);

            return Ok(result);
        }

        [HttpGet("documents")]
        [ProducesResponseType(typeof(GuideMyDocumentsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<GuideMyDocumentsDto>> GetMyDocumentsAsync()
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
        [ProducesResponseType(typeof(List<GuideMonthlyEarningsPointDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<GuideMonthlyEarningsPointDto>>> GetEarningsTimelineAsync(
            [FromQuery] int months = 12)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetEarningsTimelineAsync(guideId, months);

            return Ok(result);
        }

        [HttpGet("bookings")]
        [ProducesResponseType(typeof(List<GuideMonthlyBookingsPointDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<GuideMonthlyBookingsPointDto>>> GetBookingsTimelineAsync(
            [FromQuery] int months = 12)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetBookingsTimelineAsync(guideId, months);

            return Ok(result);
        }

        [HttpGet("tours/performance")]
        [ProducesResponseType(typeof(List<GuideTourPerformanceDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<GuideTourPerformanceDto>>> GetTourPerformanceAsync(
            [FromQuery] int take = 10,
            [FromQuery] bool mostPopular = true)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetTourPerformanceAsync(guideId, take, mostPopular);

            return Ok(result);
        }

        [HttpGet("wallet")]
        [ProducesResponseType(typeof(GuideWalletDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<GuideWalletDto>> GetWalletAsync()
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService.GetWalletAsync(guideId);

            return Ok(result);
        }

        [HttpGet("wallet/transactions")]
        [ProducesResponseType(typeof(List<GuideWalletTransactionDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<GuideWalletTransactionDto>>> GetWalletTransactionsAsync(
            [FromQuery] int take = 100)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetWalletTransactionsAsync(guideId, take);

            return Ok(result);
        }

        [HttpGet("activities")]
        [ProducesResponseType(typeof(List<GuideRecentActivityDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<GuideRecentActivityDto>>> GetRecentActivitiesAsync(
            [FromQuery] int take = 20)
        {
            var guideId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var result = await _dashboardService
                .GetRecentActivitiesAsync(guideId, take);

            return Ok(result);
        }

        // =========================
        // Tours
        // =========================

        [HttpGet("my-tours")]
        [ProducesResponseType(typeof(List<TourListItemDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<TourListItemDto>>> GetMyTours()
        {
            var guideId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(guideId))
                return Unauthorized();

            var tours = await _tourService.GetGuideToursAsync(guideId);

            return Ok(tours);
        }

        [HttpGet("tour/{id:guid}")]
        [ProducesResponseType(typeof(TourDetailsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TourDetailsDto>> GetTourById(Guid id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);

            if (tour == null)
                return NotFound();

            return Ok(tour);
        }

        [HttpPost("tour/create")]
        [ProducesResponseType(typeof(CreateTourResponseDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(CreateTourResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<CreateTourResponseDTO>> CreateTourWithImages(
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
        [ProducesResponseType(typeof(List<TourCardDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<TourCardDto>>> GetToursByPlace(int placeId)
        {

            if (placeId <= 0)
                return Ok(new { IsSucceeded = false, Message = "Place Ids Start With 1" });

            var tours = await _tourService.GetToursByPlaceAsync(placeId);

            if (tours is null || tours.Count == 0)
                return NotFound("There Is No Tour With This Place");

            return Ok(tours);
        }

        [HttpPut("tour/edit/{id:guid}")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<OperationResultDto>> UpdateTour(
            Guid id,
            [FromForm] UpdateTourRequestDTO request)
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
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<OperationResultDto>> DeleteTour(Guid id)
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