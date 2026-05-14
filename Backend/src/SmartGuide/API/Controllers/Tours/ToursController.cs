using Application.DTOs.Tour;
using Application.Services.Interfaces.Tour;
using Domain.Entities.Tours;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Tours
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

        

        // Get All Tours For TourGide To The Tourist To See The Tours To Choose One
        [Authorize(Roles = "Tourist")]
        [HttpGet("guide/{guideId}")]
        public async Task<IActionResult> GetGuideTours(string guideId)
        {
            var tours = await _tourService.GetGuideToursAsync(guideId);
            return Ok(tours);
        }

        [Authorize(Roles = "Tourist")]
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

        [Authorize(Roles = "Tourist")]
        [HttpGet("home")]
        public async Task<IActionResult> GetHomeTours()
        {
            var result = await _tourService.GetHomeToursAsync();
            if (result == null)
            {
                return NotFound();
            }
            return Ok(result);
        }

    }
}
