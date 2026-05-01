using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Saved;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Profiles
{
    public interface ITouristFavoritesService
    {
        Task<OperationResultDto> SaveAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default);
        Task<OperationResultDto> RemoveAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<SavedTourGuideDto>> GetSavedAsync(string touristUserId, CancellationToken cancellationToken = default);
    }
}
