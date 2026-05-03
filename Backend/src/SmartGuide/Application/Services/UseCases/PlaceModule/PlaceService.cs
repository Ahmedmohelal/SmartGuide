using Application.DTOs.Home;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Home;
using Domain.Entities.Home;
using Domain.Interfaces;

namespace Application.Services.UseCases.PlaceModule
{
    public class PlaceService : IPlaceService
    {
        private readonly IPlaceRepository<Place> _repo;

        public PlaceService(IPlaceRepository<Place> repo)
        {
            _repo = repo;
        }

        public async Task<Pagination<PlaceCardDto>> GetPlaces(PlaceSpecParams param)
        {
            param ??= new PlaceSpecParams();

            if (param.PageSize > 50)
                param.PageSize = 50;

            if (param.PageIndex <= 0)
                param.PageIndex = 1;

            var spec = new PlaceSpecification(param);
            var countSpec = new PlaceCountSpecification(param);

            var data = await _repo.GetAllWithSpecAsync(spec);
            var count = await _repo.CountAsync(countSpec);

            var mapped = data.Select(p => new PlaceCardDto
            {
                Id = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                Rating = p.Rating
            }).ToList();

            return new Pagination<PlaceCardDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mapped
            );
        }

        public async Task<PlaceDetailsDto?> GetById(int id)
        {
            var place = await _repo.GetByIdAsync(id);

            if (place == null)
                return null;

            return new PlaceDetailsDto
            {
                Id = place.Id,
                Name = place.Name,
                Description = place.Description,
                City = place.City,
                ImageUrl = place.ImageUrl,
                Rating = place.Rating,
                Type = place.Type,
                Location = place.Location,
                Governorate = place.Governorate,
                HistoricalBackground = place.HistoricalBackground,
                CreatedBy = place.CreatedBy,
                Period = place.Period,
                StartYear = place.StartYear,
            };
        }
    }
}