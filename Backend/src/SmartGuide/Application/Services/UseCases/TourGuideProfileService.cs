using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Domain.Interfaces;

namespace Application.Services.UseCases
{
    public class TourGuideProfileService : ProfileServiceBase<TourGuideProfileDto, UpdateTourGuideProfileDto>, ITourGuideProfileService
    {
        public TourGuideProfileService(IProfileRepository<TourGuideProfileDto, UpdateTourGuideProfileDto> repository)
            : base(repository)
        {
        }
    }
}
