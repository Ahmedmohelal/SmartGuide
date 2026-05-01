using Application.DTOs.Saved;
using Application.Services.Interfaces.PictureMaker;
using Domain.Entities;
using Domain.Entities.Profiles.TourGuide;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
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
            var favorites = await _context.SavedTourGuides
                .AsNoTracking()
                .Where(x => x.TouristUserId == touristUserId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .Join(
                    _context.TourGuideProfiles.AsNoTracking(),
                    saved => saved.TourGuideUserId,
                    profile => profile.UserId,
                    (saved, profile) => new { profile, saved.TourGuideUserId }
                )
                .Join(
                    _context.Users.AsNoTracking(),
                    result => result.TourGuideUserId,
                    user => user.Id,
                    (result, user) => new { result.profile, user }
                )
                .ToListAsync(cancellationToken);

            return favorites.Select(x => MapToDto(x.profile, x.user)).ToList();
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
        private SavedTourGuideDto MapToDto(TourGuideProfile profile, ApplicationUser? user)
        {
            var storedProfileImage = profile.ProfilePicture ?? user?.ProfileImage;

            return new SavedTourGuideDto
            {
                GuideId = profile.UserId,
                Name = $"{user?.FirstName ?? string.Empty} {user?.LastName ?? string.Empty}".Trim(),
                Location = user?.Country ?? string.Empty,
                ProfilePictureUrl = _imageUrlService.ToPublicImageUrl(storedProfileImage, "profileImages")
            };
        }
    }
}
