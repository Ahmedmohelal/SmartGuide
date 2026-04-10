using Application.DTOs.ProfileDTOs;

namespace Application.Services.Interfaces
{
    public interface ITourGuideProfileService : IProfileService<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
    }
}
