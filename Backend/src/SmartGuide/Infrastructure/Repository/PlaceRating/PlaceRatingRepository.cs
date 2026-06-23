using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repository.PlaceRating
{
    public class PlaceRatingRepository
        : IPlaceRatingRepository
    {
        private readonly ApplicationDbContext _context;

        public PlaceRatingRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Domain.Entities.PlaceRatings.PlaceRating?> GetUserRatingAsync(
            string userId,
            int placeId)
        {
            return await _context.PlaceRatings
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.PlaceId == placeId);
        }

        public async Task AddAsync(Domain.Entities.PlaceRatings.PlaceRating rating)
        {
            await _context.PlaceRatings.AddAsync(rating);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<bool> PlaceExistsAsync(
            int placeId)
        {
            return await _context.Places.Include(p => p.Ratings)
                .AnyAsync(x => x.Id == placeId);
        }
    }
}
