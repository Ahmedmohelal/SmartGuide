using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.SavedPlaces;
using Application.Services.Interfaces;
using Domain.Interfaces;

namespace Application.Services.UseCases
{
    public class SavedPlacesService : ISavedPlacesService
    {
        private readonly ISavedPlacesRepository<SavedPlaceDto> _repository;

        public SavedPlacesService(
            ISavedPlacesRepository<SavedPlaceDto> repository)
        {
            _repository = repository;
        }

        public async Task<OperationResultDto> SaveAsync(
            string touristUserId,
            int placeId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tourist user id is required."
                };
            }

            var touristExists = await _repository
                .TouristExistsAsync(touristUserId, cancellationToken);

            if (!touristExists)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tourist profile not found."
                };
            }

            var placeExists = await _repository
                .PlaceExistsAsync(placeId, cancellationToken);

            if (!placeExists)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Place not found."
                };
            }

            var alreadySaved = await _repository
                .SavedPlaceExistsAsync(
                    touristUserId,
                    placeId,
                    cancellationToken);

            if (alreadySaved)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Place already saved."
                };
            }

            await _repository.AddSavedPlaceAsync(
                touristUserId,
                placeId,
                cancellationToken);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Place saved successfully."
            };
        }

        public async Task<OperationResultDto> RemoveAsync(
            string touristUserId,
            int placeId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tourist user id is required."
                };
            }

            var removed = await _repository
                .RemoveSavedPlaceAsync(
                    touristUserId,
                    placeId,
                    cancellationToken);

            if (!removed)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Saved place not found."
                };
            }

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Place removed from saved places."
            };
        }

        public Task<IReadOnlyList<SavedPlaceDto>> GetSavedAsync(
            string touristUserId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
            {
                return Task.FromResult<IReadOnlyList<SavedPlaceDto>>(
                    Array.Empty<SavedPlaceDto>());
            }

            return _repository.GetSavedPlacesAsync(
                touristUserId,
                cancellationToken);
        }
    }
}