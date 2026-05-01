using Application.DTOs.ProfileDTOs;

namespace Application.Services.Interfaces.Profiles
{
    public interface ITouristProfileService : IProfileService<TouristProfileDto, UpdateTouristProfileDto>
    {
    }
}
