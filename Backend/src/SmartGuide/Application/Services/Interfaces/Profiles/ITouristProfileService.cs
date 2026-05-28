using Application.DTOs.ProfileDTOs;
using Application.DTOs.Tour;

namespace Application.Services.Interfaces.Profiles
{
    public interface ITouristProfileService : IProfileService<TouristProfileDto, UpdateTouristProfileDto>
    {
        Task<List<TourListItemDto>> GetTouristToursAsync(string touristId);

    }
}
