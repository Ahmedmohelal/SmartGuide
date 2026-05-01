using Application.DTOs.ProfileDTOs;

namespace Application.Services.Interfaces.Profiles
{
    public interface ITourGuideProfileService : IProfileService<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
    }
}
