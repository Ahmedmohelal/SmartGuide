using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using Application.DTOs.PlaceRatings;
using Application.DTOs.SavedPlaces;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Cashing;
using Application.Services.Interfaces.Home;
using Domain.Entities.Home;
using Domain.Entities.PlaceRatings;
using Domain.Interfaces;

namespace Application.Services.UseCases.PlaceModule
{
    public class PlaceService : IPlaceService
    {
        private readonly IPlaceRepository<Place> _repo;

        private readonly ISavedPlacesRepository<SavedPlaceDto> _savedPlacesRepository;
        private readonly IPlaceRatingRepository _ratingRepo;
        private readonly IRedisCacheService _cache;

        public PlaceService(
            IPlaceRepository<Place> repo,
            ISavedPlacesRepository<SavedPlaceDto> savedPlacesRepository,
            IPlaceRatingRepository placeRatingRepository ,
            IRedisCacheService cache)
        {
            _repo = repo;
            _savedPlacesRepository = savedPlacesRepository;
            _ratingRepo = placeRatingRepository;
            _cache = cache;
        }

        public async Task<Pagination<PlaceCardDto>> GetPlaces(
            PlaceSpecParams param,
            string? touristUserId)
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

            HashSet<int> savedPlaceIds = new();

            if (!string.IsNullOrWhiteSpace(touristUserId))
            {
                var savedPlaces = await _savedPlacesRepository
                    .GetSavedPlacesAsync(touristUserId);

                savedPlaceIds = savedPlaces
                    .Select(x => x.PlaceId)
                    .ToHashSet();
            }

            var mapped = data.Select(p => new PlaceCardDto
            {
                Id = p.Id,
                Name = p.Name,
                ImageUrl = p.ImageUrl,
                Rating = p.Ratings.Any() ? p.Ratings.Average(x => x.Rating) : 0,
                IsSaved = savedPlaceIds.Contains(p.Id)

            }).ToList();

            return new Pagination<PlaceCardDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mapped
            );
        }

        public async Task<PlaceDetailsDto?> GetById(int id , string? userId)
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

                AverageRating = place.Ratings.Any() ? place.Ratings.Average(x => x.Rating) : 0,
                RatingsCount = place.Ratings.Count,
                MyRating = place.Ratings.FirstOrDefault(x => x.UserId == userId)?.Rating,
                
                Reviews = place.Ratings
        .Where(x =>
            !string.IsNullOrWhiteSpace(x.Review))
        .OrderByDescending(x => x.CreatedAtUtc)
        .Take(10)
        .Select(x => new PlaceReviewDto
        {
            Rating = x.Rating,

            Review = x.Review,

            CreatedAtUtc = x.CreatedAtUtc
        })
        .ToList(),

                //Rating = place.Rating,

                Type = place.Type,
                Location = place.Location,
                Governorate = place.Governorate,
                HistoricalBackground = place.HistoricalBackground,
                CreatedBy = place.CreatedBy,
                Period = place.Period,
                StartYear = place.StartYear,
            };
        }

        public async Task<OperationResultDto> AddRatingAsync(int placeId, string userId, AddPlaceRatingDto dto)
        {
            var placeExists =
                await _ratingRepo.PlaceExistsAsync(placeId);

            if (!placeExists)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Place not found"
                };
            }

            var existing =
                await _ratingRepo.GetUserRatingAsync(
                    userId,
                    placeId);

            if (existing != null)
            {
                existing.Rating = dto.Rating;

                existing.Review = dto.Review;

                existing.UpdatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                await _ratingRepo.AddAsync(
                    new PlaceRating
                    {
                        Id = Guid.NewGuid(),

                        UserId = userId,

                        PlaceId = placeId,

                        Rating = dto.Rating,

                        Review = dto.Review
                    });
            }

            await _ratingRepo.SaveChangesAsync();

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Rating saved successfully"
            };
        }
    }
}