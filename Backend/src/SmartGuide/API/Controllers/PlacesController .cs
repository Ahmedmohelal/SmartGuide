using Application.DTOs.Home;
using Application.Services.Interfaces.Home;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlacesController : ControllerBase
    {
        private readonly IPlaceService _service;

        public PlacesController(IPlaceService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<Pagination<PlaceCardDto>>> GetPlaces(
            [FromQuery] PlaceSpecParams param)
        {
            var result = await _service.GetPlaces(param);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PlaceDetailsDto>> GetPlace(int id)
        {
            var result = await _service.GetById(id);

            if (result == null)
                return NotFound(new { message = "Place not found" });

            return Ok(result);
        }
    }
}