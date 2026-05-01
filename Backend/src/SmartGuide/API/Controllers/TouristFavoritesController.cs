using Application.DTOs.Saved;
using Application.DTOs.Saved;
using Application.Services.Interfaces.Profiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers;

[Route("api/tourists/me/savedguides")]
[ApiController]
[Authorize]
public class TouristFavoritesController : ControllerBase
{
    private readonly ITouristFavoritesService _favoritesService;

    public TouristFavoritesController(ITouristFavoritesService favoritesService)
    {
        _favoritesService = favoritesService;
    }

    [HttpPost]
    public async Task<IActionResult> SaveAsync([FromBody] SaveTourGuideRequestDto model, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var touristUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(touristUserId))
            return Unauthorized();

        var result = await _favoritesService.SaveAsync(touristUserId, model.GuideId, cancellationToken);

        if (!result.IsSuccess && result.Message == "Tour guide already saved.")
            return Conflict(result);

        if (!result.IsSuccess && (result.Message == "Tourist profile not found." || result.Message == "Tour guide profile not found."))
            return NotFound(result);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetSavedAsync(CancellationToken cancellationToken)
    {
        // Get UserId By The TOKEN 
        // Instead Of Passing It From The Client Side To Avoid Any Security Issues
        var touristUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(touristUserId))
            return Unauthorized();

        var result = await _favoritesService.GetSavedAsync(touristUserId, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{guideId}")]
    public async Task<IActionResult> RemoveAsync([FromRoute] string guideId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(guideId))
            return BadRequest(new { message = "Guide id is required." });

        var touristUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(touristUserId))
            return Unauthorized();

        var result = await _favoritesService.RemoveAsync(touristUserId, guideId, cancellationToken);

        if (!result.IsSuccess && result.Message == "Saved tour guide not found.")
            return NotFound(result);

        if (!result.IsSuccess)
            return BadRequest(result);

        return Ok(result);
    }
}

