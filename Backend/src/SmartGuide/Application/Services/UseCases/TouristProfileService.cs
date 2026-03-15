using Application.DTOs;
using Application.Services.Interfaces;
using Domain.Interfaces;

namespace Application.Services.UseCases
{
    public class TouristProfileService : ProfileServiceBase<TouristProfileDto, UpdateTouristProfileDto>, ITouristProfileService
    {
        public TouristProfileService(IProfileRepository<TouristProfileDto, UpdateTouristProfileDto> repository)
            : base(repository)
        {
        }
    }
}
