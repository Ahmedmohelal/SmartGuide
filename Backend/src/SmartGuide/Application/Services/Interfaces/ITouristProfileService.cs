using Application.DTOs;

namespace Application.Services.Interfaces
{
    public interface ITouristProfileService : IProfileService<TouristProfileDto, UpdateTouristProfileDto>
    {
    }
}
