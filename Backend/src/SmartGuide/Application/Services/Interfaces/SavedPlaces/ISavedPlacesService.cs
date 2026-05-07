using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.SavedPlaces;

namespace Application.Services.Interfaces
{
    public interface ISavedPlacesService
    {
        Task<OperationResultDto> SaveAsync(string touristUserId,int placeId,CancellationToken cancellationToken = default);

        Task<OperationResultDto> RemoveAsync(string touristUserId,int placeId,CancellationToken cancellationToken = default);

        Task<IReadOnlyList<SavedPlaceDto>> GetSavedAsync(string touristUserId,CancellationToken cancellationToken = default);
    }
}