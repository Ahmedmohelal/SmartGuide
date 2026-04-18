using Application.DTOs.Saved;
using Application.Services.Interfaces;
using Domain.Entities;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repository.Profile
{
    public class TouristFavoritesRepository : ITouristFavoritesRepository<SavedTourGuideDto>
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageUrlService _imageUrlService;

        public TouristFavoritesRepository(ApplicationDbContext context, IImageUrlService imageUrlService)
        {
            _context = context;
            _imageUrlService = imageUrlService;
        }
        public async Task AddFavoriteAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default)
        {
            _context.SavedTourGuides.Add(new SavedTourGuide
            {
                TouristUserId = touristUserId,
                TourGuideUserId = tourGuideUserId,
                CreatedAtUtc = DateTime.UtcNow
            });

            await _context.SaveChangesAsync(cancellationToken);
        }

        public Task<bool> FavoriteExistsAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default)
        {
            return _context.SavedTourGuides
                .AsNoTracking()
                .AnyAsync(x => x.TouristUserId == touristUserId && x.TourGuideUserId == tourGuideUserId, cancellationToken);
        }

        public async Task<IReadOnlyList<SavedTourGuideDto>> GetFavoritesAsync(string touristUserId, CancellationToken cancellationToken = default)
        {
            var guideIds = await _context.SavedTourGuides
                .AsNoTracking()
                .Where(x => x.TouristUserId == touristUserId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .Select(x => x.TourGuideUserId)
                .ToListAsync(cancellationToken);

            if (guideIds.Count == 0)
                return Array.Empty<SavedTourGuideDto>();

            var profiles = await _context.TourGuideProfiles
                .AsNoTracking()
                .Include(x => x.User)
                .Where(x => guideIds.Contains(x.UserId))
                .ToListAsync(cancellationToken);

            var mapped = profiles.Select(MapToDto).ToList();

            // Keep results ordered according to favorites list order.
            var byId = mapped.ToDictionary(x => x.GuideId, StringComparer.Ordinal);
            var ordered = new List<SavedTourGuideDto>(mapped.Count);
            foreach (var id in guideIds)
            {
                if (byId.TryGetValue(id, out var dto))
                    ordered.Add(dto);
            }

            return ordered;
        }

        public async Task<bool> RemoveFavoriteAsync(string touristUserId, string tourGuideUserId, CancellationToken cancellationToken = default)
        {
            var entity = await _context.SavedTourGuides
                .FirstOrDefaultAsync(x => x.TouristUserId == touristUserId && x.TourGuideUserId == tourGuideUserId, cancellationToken);

            if (entity is null)
                return false;

            _context.SavedTourGuides.Remove(entity);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public Task<bool> TouristExistsAsync(string touristUserId, CancellationToken cancellationToken = default)
        {
            return _context.TouristProfiles
                .AsNoTracking()
                .AnyAsync(x => x.UserId == touristUserId, cancellationToken);
        }

        public Task<bool> TourGuideExistsAsync(string tourGuideUserId, CancellationToken cancellationToken = default)
        {
            return _context.TourGuideProfiles
                .AsNoTracking()
                .AnyAsync(x => x.UserId == tourGuideUserId, cancellationToken);
        }
        private SavedTourGuideDto MapToDto(TourGuideProfile profile)
        {
            var storedProfileImage = profile.ProfilePicture ?? profile.User?.ProfileImage;

            return new SavedTourGuideDto
            {
                GuideId = profile.UserId,
                Name = $"{profile.User?.FirstName ?? string.Empty} {profile.User?.LastName ?? string.Empty}".Trim(),
                Location = profile.User?.Country ?? string.Empty,
                ProfilePictureUrl = _imageUrlService.ToPublicImageUrl(storedProfileImage, "profileImages")
            };
        }
    }
}
