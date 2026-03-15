using Application.DTOs;

namespace Application.Services.Interfaces
{
    public interface ITourGuideProfileService : IProfileService<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
    }
}
