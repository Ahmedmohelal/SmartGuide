using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces
{
    public interface ITouristFavoritesRepository<T>
    {
        Task<bool> FavoriteExistsAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default);
        Task<bool> TouristExistsAsync(string touristUserId, CancellationToken cancellationToken = default);
        Task<bool> TourGuideExistsAsync(string tourGuideUserId, CancellationToken cancellationToken = default);

        Task AddFavoriteAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default);
        Task<bool> RemoveFavoriteAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default);

        Task<IReadOnlyList<T>> GetFavoritesAsync(string touristUserId, CancellationToken cancellationToken = default);
    }
}
