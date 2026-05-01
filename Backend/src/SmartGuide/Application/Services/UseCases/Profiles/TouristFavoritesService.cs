using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Saved;
using Application.Services.Interfaces.Profiles;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases.Profiles
{
    public class TouristFavoritesService : ITouristFavoritesService
    {
        private readonly ITouristFavoritesRepository<SavedTourGuideDto> _repository;

        public TouristFavoritesService(ITouristFavoritesRepository<SavedTourGuideDto> repository)
        {
            _repository = repository;
        }
        public Task<IReadOnlyList<SavedTourGuideDto>> GetSavedAsync(string touristUserId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
                return Task.FromResult<IReadOnlyList<SavedTourGuideDto>>(Array.Empty<SavedTourGuideDto>());

            return _repository.GetFavoritesAsync(touristUserId, cancellationToken);
        }

        public async Task<OperationResultDto> RemoveAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
                return new OperationResultDto { IsSuccess = false, Message = "Tourist user id is required." };

            if (string.IsNullOrWhiteSpace(guideUserId))
                return new OperationResultDto { IsSuccess = false, Message = "Guide id is required." };

            var removed = await _repository.RemoveFavoriteAsync(touristUserId, guideUserId, cancellationToken);
            if (!removed)
                return new OperationResultDto { IsSuccess = false, Message = "Saved tour guide not found." };

            return new OperationResultDto { IsSuccess = true, Message = "Tour guide removed from saved list." };
        }

        public async Task<OperationResultDto> SaveAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(touristUserId))
                return new OperationResultDto { IsSuccess = false, Message = "Tourist user id is required." };

            if (string.IsNullOrWhiteSpace(guideUserId))
                return new OperationResultDto { IsSuccess = false, Message = "Guide id is required." };

            if (touristUserId == guideUserId)
                return new OperationResultDto { IsSuccess = false, Message = "You cannot save yourself as a tour guide." };

            var touristExists = await _repository.TouristExistsAsync(touristUserId, cancellationToken);
            if (!touristExists)
                return new OperationResultDto { IsSuccess = false, Message = "Tourist profile not found." };

            var guideExists = await _repository.TourGuideExistsAsync(guideUserId, cancellationToken);
            if (!guideExists)
                return new OperationResultDto { IsSuccess = false, Message = "Tour guide profile not found." };

            var exists = await _repository.FavoriteExistsAsync(touristUserId, guideUserId, cancellationToken);
            if (exists)
                return new OperationResultDto { IsSuccess = false, Message = "Tour guide already saved." };

            await _repository.AddFavoriteAsync(touristUserId, guideUserId, cancellationToken);

            return new OperationResultDto { IsSuccess = true, Message = "Tour guide saved successfully." };
        }
    }
}
