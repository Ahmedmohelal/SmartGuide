using Application.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public abstract class ProfileControllerBase<TProfileDto, TUpdateDto> : ControllerBase
    {
        protected abstract IProfileService<TProfileDto, TUpdateDto> ProfileService { get; }
        protected abstract string ProfileName { get; }

        protected async Task<ActionResult<TProfileDto>> GetProfileAsync(string id)
        {
            var profile = await ProfileService.GetProfileByIdAsync(id);
            if (profile is null)
                return NotFound(new { message = $"{ProfileName} profile not found." });

            return Ok(profile);
        }

        protected async Task<ActionResult<TProfileDto>> UpdateProfileAsync(string id, TUpdateDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var profile = await ProfileService.UpdateProfileAsync(id, model);
            if (profile is null)
                return NotFound(new { message = $"{ProfileName} profile not found." });

            return Ok(profile);
        }
    }
}
