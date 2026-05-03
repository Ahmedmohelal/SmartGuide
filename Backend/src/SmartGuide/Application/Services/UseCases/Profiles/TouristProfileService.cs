using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces.Profiles;
using Domain.Interfaces;

namespace Application.Services.UseCases.Profiles
{
    public class TouristProfileService : ProfileServiceBase<TouristProfileDto, UpdateTouristProfileDto>, ITouristProfileService
    {
        public TouristProfileService(IProfileRepository<TouristProfileDto, UpdateTouristProfileDto> repository)
            : base(repository)
        {
        }
    }
}
