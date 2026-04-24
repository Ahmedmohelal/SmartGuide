using Application.DTOs.Tour;
using Application.Services.Interfaces.Tour;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ToursController : ControllerBase
    {

        private readonly ITourService _tourService;

        public ToursController(ITourService tourService)
        {
            _tourService = tourService;
        }

        // Get All Tours For TourGide For Him 
        [Authorize(Roles = "TourGuide")]
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

        // Get All Tours For TourGide To The Tourist To See The Tours To Choose One
        [Authorize(Roles ="Tourist")]
        [HttpGet("guide/{guideId}")]
        public async Task<IActionResult> GetGuideTours(string guideId)
        {
            var tours = await _tourService.GetGuideToursAsync(guideId);
            return Ok(tours);
        }

        [Authorize(Roles = "Tourist,TourGuide")]
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTourById(Guid id)
        {
            var tour = await _tourService.GetTourByIdAsync(id);
            if (tour == null)
            {
                return NotFound();
            }
            return Ok(tour);
        }

        [Authorize(Roles = "TourGuide")]
        [HttpPost("create")]
        public async Task<IActionResult> CreateTourWithImages(
        [FromForm] CreateTourRequestDTO request)
        {
            var userId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var res = await _tourService.CreateTourAsync(request, userId);

            if (!res.IsSucceded)
                return BadRequest(res);

            return Ok(res);
        }

        [Authorize(Roles = "TourGuide")]
        [HttpPut("{id:guid}")]
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
        [Authorize(Roles = "TourGuide")]
        [HttpDelete("{id:guid}")]
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
