using Application.DTOs;
using Application.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/tour-guides")]
    [ApiController]
    [Authorize]
    public class TourGuideProfileController : ProfileControllerBase<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
        private readonly ITourGuideProfileService _tourGuideProfileService;

        public TourGuideProfileController(ITourGuideProfileService tourGuideProfileService)
        {
            _tourGuideProfileService = tourGuideProfileService;
        }

        protected override IProfileService<TourGuideProfileDto, UpdateTourGuideProfileDto> ProfileService => _tourGuideProfileService;
        protected override string ProfileName => "Tour guide";

        [HttpGet("{id}/profile")]
        public Task<ActionResult<TourGuideProfileDto>> GetProfileByIdAsync(string id)
        {
            return GetProfileAsync(id);
        }

        [HttpPut("{id}/profile")]
        public Task<ActionResult<TourGuideProfileDto>> UpdateProfileByIdAsync(string id, [FromBody] UpdateTourGuideProfileDto model)
        {
            return UpdateProfileAsync(id, model);
        }
    }
}
