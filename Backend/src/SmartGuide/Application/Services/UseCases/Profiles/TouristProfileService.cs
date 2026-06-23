using Application.DTOs.ProfileDTOs;
using Application.DTOs.Tour;
using Application.Services.Interfaces.PictureMaker;
using Application.Services.Interfaces.Profiles;
using Domain.Interfaces;

namespace Application.Services.UseCases.Profiles
{
    public class TouristProfileService : ProfileServiceBase<TouristProfileDto, UpdateTouristProfileDto>, ITouristProfileService
    {
        private readonly IImageUrlService _imageUrlService;
        private readonly ITourRepository _tourRepository;

        public TouristProfileService(IProfileRepository<TouristProfileDto, UpdateTouristProfileDto> repository, IImageUrlService imageUrlService , ITourRepository tourRepository)
            : base(repository)
        {
            _imageUrlService = imageUrlService;
            _tourRepository = tourRepository;
        }

        public async Task<List<TourListItemDto>> GetTouristToursAsync(string touristId)
        {
            var tours = await _tourRepository.GetTouristToursAsync(touristId);

            return tours.Select(t => new TourListItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DurationHours = t.DurationHours,
                Price = t.Price,
                MaxGroupSize = t.MaxGroupSize,
                PrimaryImage = _imageUrlService.ToPublicImageUrl(
                    t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                    $"ToursImages/{t.Id}"
                ) ?? string.Empty
            }).ToList();
        }
    }
}
