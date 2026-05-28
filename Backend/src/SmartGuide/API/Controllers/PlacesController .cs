using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using Application.DTOs.PlaceRatings;
using Application.Services.Interfaces.Home;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
    [Authorize]
    public async Task<ActionResult<Pagination<PlaceCardDto>>> GetPlaces(
    [FromQuery] PlaceSpecParams param)
    {
        if (param.PageIndex <= 0)
            return BadRequest(new
            {
                message = "PageIndex must be greater than 0"
            });

        if (param.PageSize <= 0 || param.PageSize > 50)
            return BadRequest(new
            {
                message = "PageSize must be between 1 and 50"
            });

        var touristUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        var result = await _service.GetPlaces(
            param,
            touristUserId);

        if (result == null || result.Data.Count == 0)
            return NotFound(new
            {
                message = "No places found"
            });

        return Ok(result);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<PlaceDetailsDto>>
    GetPlace(int id)
    {
        if (id <= 0)
        {
            return BadRequest(new
            {
                message = "Invalid place id"
            });
        }

        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var result =
            await _service.GetById(id, userId);

        if (result == null)
        {
            return NotFound(new
            {
                message = "Place not found"
            });
        }

        return Ok(result);
    }

    [HttpPost("{placeId}/rate")]
    [Authorize]
    public async Task<ActionResult<OperationResultDto>>
    RatePlace(
        int placeId,
        [FromBody] AddPlaceRatingDto dto)
    {
        var userId =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var result =
            await _service.AddRatingAsync(
                placeId,
                userId,
                dto);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}