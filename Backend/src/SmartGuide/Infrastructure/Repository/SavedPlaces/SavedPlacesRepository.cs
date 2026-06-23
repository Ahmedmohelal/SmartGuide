using Application.DTOs.SavedPlaces;
using Domain.Entities.Home;
using Domain.Entities.SavedPlaces;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Profile
{
    public class SavedPlacesRepository
        : ISavedPlacesRepository<SavedPlaceDto>
    {
        private readonly ApplicationDbContext _context;

        public SavedPlacesRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddSavedPlaceAsync(
            string touristUserId,
            int placeId,
            CancellationToken cancellationToken = default)
        {
            var savedPlace = new SavedPlace
            {
                TouristUserId = touristUserId,
                PlaceId = placeId,
                CreatedAtUtc = DateTime.UtcNow
            };

            _context.SavedPlaces.Add(savedPlace);

            await _context.SaveChangesAsync(cancellationToken);
        }

        public Task<bool> SavedPlaceExistsAsync(
            string touristUserId,
            int placeId,
            CancellationToken cancellationToken = default)
        {
            return _context.SavedPlaces
                .AsNoTracking()
                .AnyAsync(x =>
                    x.TouristUserId == touristUserId &&
                    x.PlaceId == placeId,
                    cancellationToken);
        }

        public Task<bool> TouristExistsAsync(
            string touristUserId,
            CancellationToken cancellationToken = default)
        {
            return _context.TouristProfiles
                .AsNoTracking()
                .AnyAsync(x =>
                    x.UserId == touristUserId,
                    cancellationToken);
        }

        public Task<bool> PlaceExistsAsync(
            int placeId,
            CancellationToken cancellationToken = default)
        {
            return _context.Places
                .AsNoTracking()
                .AnyAsync(x =>
                    x.Id == placeId,
                    cancellationToken);
        }

        public async Task<bool> RemoveSavedPlaceAsync(
            string touristUserId,
            int placeId,
            CancellationToken cancellationToken = default)
        {
            var entity = await _context.SavedPlaces
                .FirstOrDefaultAsync(x =>
                    x.TouristUserId == touristUserId &&
                    x.PlaceId == placeId,
                    cancellationToken);

            if (entity is null)
                return false;

            _context.SavedPlaces.Remove(entity);

            await _context.SaveChangesAsync(cancellationToken);

            return true;
        }

        public async Task<IReadOnlyList<SavedPlaceDto>> GetSavedPlacesAsync(
            string touristUserId,
            CancellationToken cancellationToken = default)
        {
            return await _context.SavedPlaces
    .Include(x => x.Place)
    .ThenInclude(x => x.Ratings)
    .AsNoTracking()
    .Where(x => x.TouristUserId == touristUserId)
    .OrderByDescending(x => x.CreatedAtUtc)
    .Select(x => new SavedPlaceDto
    {
        PlaceId = x.Place.Id,
        Name = x.Place.Name,
        Description = x.Place.Description,
        ImageUrl = x.Place.ImageUrl,
        City = x.Place.City,

        Rating = x.Place.Ratings.Any()
            ? x.Place.Ratings.Average(r => r.Rating)
            : 0
    })
    .ToListAsync(cancellationToken);
        }
    }
}