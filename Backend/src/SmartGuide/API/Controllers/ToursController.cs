using Application.Services.Interfaces.Tour;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ToursController : ControllerBase
    {

        private readonly ITourService _tourService;

        public ToursController(ITourService tourService)
        {
            _tourService = tourService;
        }


        [HttpGet("Tours/{Id}")]
        public async Task<IActionResult> GetTourById(string Id)
        {
            var tour = await _tourService.GetGuideToursAsync(Id);
            if (tour == null)
            {
                return NotFound();
            }
            return Ok(tour);
        }
    }
}
