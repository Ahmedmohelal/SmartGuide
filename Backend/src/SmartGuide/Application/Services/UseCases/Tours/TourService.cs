using Application.DTOs.Tour;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Tour;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases.Tours
{
    public class TourService : ITourService
    {
        private readonly ITourRepository _tourRepository;
        private readonly IImageUrlService _imageUrlService;

        public TourService(ITourRepository tourRepository, IImageUrlService imageUrlService)
        {
            _tourRepository = tourRepository;
            _imageUrlService = imageUrlService;
        }

        public async Task<List<TourListItemDto>> GetGuideToursAsync(string guideId)
        {
            var tours = await _tourRepository.GetGuideToursAsync(guideId);

            var tourDtos = tours.Select(t => new TourListItemDto
            {
                Id = t.Id,
                Title = t.Title,
                DurationHours = t.DurationHours,
                Price = t.Price,
                PrimaryImage = _imageUrlService.ToPublicImageUrl(t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl ,"ToursImages") ?? string.Empty,
            }).ToList();

            return tourDtos;

        }
    }
}
