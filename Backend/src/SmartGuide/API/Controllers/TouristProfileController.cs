using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces.Profiles;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/tourists")]
    [ApiController]
    [Authorize]
    public class TouristProfileController : ProfileControllerBase<TouristProfileDto, UpdateTouristProfileDto>
    {
        private readonly ITouristProfileService _touristProfileService;

        public TouristProfileController(ITouristProfileService touristProfileService)
        {
            _touristProfileService = touristProfileService;
        }

        protected override IProfileService<TouristProfileDto, UpdateTouristProfileDto> ProfileService => _touristProfileService;
        protected override string ProfileName => "Tourist";

        [HttpGet("{id}/profile")]
        public Task<ActionResult<TouristProfileDto>> GetProfileByIdAsync(string id)
        {
            return GetProfileAsync(id);
        }

        [HttpPut("{id}/profile")]
        [Authorize(Roles = "Tourist")]
        public Task<ActionResult<TouristProfileDto>> UpdateProfileByIdAsync(string id, [FromForm] UpdateTouristProfileDto model)
        {
            return UpdateProfileAsync(id, model);
        }

        [HttpGet("my-tours")]
        [Authorize(Roles = "Tourist")]
        public async Task<IActionResult> GetMyTours()
        {
            var touristId = User.FindFirstValue("userId")
                         ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(touristId))
                return Unauthorized();

            var tours = await _touristProfileService.GetTouristToursAsync(touristId);

            return Ok(tours);
        }
    }
}
