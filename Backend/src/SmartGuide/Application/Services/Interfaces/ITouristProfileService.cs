using Application.DTOs.ProfileDTOs;

namespace Application.Services.Interfaces
{
    public interface ITouristProfileService : IProfileService<TouristProfileDto, UpdateTouristProfileDto>
    {
    }
}
