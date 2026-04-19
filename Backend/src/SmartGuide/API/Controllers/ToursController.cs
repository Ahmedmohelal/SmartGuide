using Application.DTOs.Tour;
using Application.Services.Interfaces.Tour;
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

        [HttpPost("create")]
        public async Task<IActionResult> CreateTour([FromForm] CreateTourRequestDTO request)
        {
            var userId = User.FindFirstValue("userId") ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
            {
                return Unauthorized();
            }

            var res = await _tourService.CreateTourAsync(request, userId);
            if (!res.IsSucceded)
            {
                return BadRequest(res);
            }

            return CreatedAtAction(nameof(GetTourById), new { id = res.Id }, res);
        }
    }
}
