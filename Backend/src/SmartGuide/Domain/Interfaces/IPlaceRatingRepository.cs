using Domain.Entities.PlaceRatings;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces
{
    public interface IPlaceRatingRepository
    {
        Task<PlaceRating?> GetUserRatingAsync(
            string userId,
            int placeId);

        Task AddAsync(PlaceRating rating);

        Task SaveChangesAsync();

        Task<bool> PlaceExistsAsync(int placeId);
    }
}
