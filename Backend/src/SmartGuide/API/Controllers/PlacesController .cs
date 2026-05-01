using Application.DTOs.Home;
using Application.Services.Interfaces.Home;
using Microsoft.AspNetCore.Mvc;

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
        if (param.PageIndex <= 0)
            return BadRequest(new { message = "PageIndex must be greater than 0" });

        if (param.PageSize <= 0 || param.PageSize > 50)
            return BadRequest(new { message = "PageSize must be between 1 and 50" });

        var result = await _service.GetPlaces(param);

        if (result == null || result.Data.Count == 0)
            return NotFound(new { message = "No places found" });

        return Ok(result);

    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlaceDetailsDto>> GetPlace(int id)
    {
        if (id <= 0)
            return BadRequest(new { message = "Invalid place id" });

        

            var result = await _service.GetById(id);

            if (result == null)
                return NotFound(new { message = "Place not found" });

            return Ok(result);
    }
}