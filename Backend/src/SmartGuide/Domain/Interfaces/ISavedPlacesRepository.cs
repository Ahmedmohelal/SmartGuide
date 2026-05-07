using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces
{
    public interface ISavedPlacesRepository<TSavedPlaceDto>
    {
        Task AddSavedPlaceAsync(string touristUserId, int placeId, CancellationToken cancellationToken = default);

        Task<bool> RemoveSavedPlaceAsync(string touristUserId, int placeId, CancellationToken cancellationToken = default);

        Task<bool> SavedPlaceExistsAsync(string touristUserId, int placeId, CancellationToken cancellationToken = default);

        Task<bool> TouristExistsAsync(string touristUserId, CancellationToken cancellationToken = default);

        Task<bool> PlaceExistsAsync(int placeId, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<TSavedPlaceDto>> GetSavedPlacesAsync(string touristUserId, CancellationToken cancellationToken = default);
    }
}
