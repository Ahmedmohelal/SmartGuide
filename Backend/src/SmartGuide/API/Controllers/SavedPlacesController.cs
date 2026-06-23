using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.SavedPlaces;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/tourists/me/savedplaces")]
    [ApiController]
    [Authorize]
    public class SavedPlacesController : ControllerBase
    {
        private readonly ISavedPlacesService _savedPlacesService;

        public SavedPlacesController(
            ISavedPlacesService savedPlacesService)
        {
            _savedPlacesService = savedPlacesService;
        }

        [HttpPost]
        public async Task<ActionResult<OperationResultDto>> SaveAsync(
            [FromBody] SavePlaceRequestDto model,
            CancellationToken cancellationToken = default)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var touristUserId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristUserId))
                return Unauthorized();

            var result = await _savedPlacesService.SaveAsync(
                touristUserId,
                model.PlaceId,
                cancellationToken);

            if (!result.IsSuccess &&
                result.Message == "Place already saved.")
            {
                return Conflict(result);
            }

            if (!result.IsSuccess &&
                (result.Message == "Tourist profile not found." ||
                 result.Message == "Place not found."))
            {
                return NotFound(result);
            }

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<SavedPlaceDto>>> GetSavedAsync(
            CancellationToken cancellationToken)
        {
            var touristUserId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristUserId))
                return Unauthorized();

            var result = await _savedPlacesService
                .GetSavedAsync(
                    touristUserId,
                    cancellationToken);

            return Ok(result);
        }

        [HttpDelete("{placeId}")]
        public async Task<ActionResult<OperationResultDto>> RemoveAsync(
            [FromRoute] int placeId,
            CancellationToken cancellationToken)
        {
            var touristUserId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristUserId))
                return Unauthorized();

            var result = await _savedPlacesService
                .RemoveAsync(
                    touristUserId,
                    placeId,
                    cancellationToken);

            if (!result.IsSuccess &&
                result.Message == "Saved place not found.")
            {
                return NotFound(result);
            }

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }
    }
}