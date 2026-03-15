using Application.DTOs;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Profiles.TourGuide;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Profile
{
    public class TourGuideProfileRepository : IProfileRepository<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
        private readonly ApplicationDbContext _context;

        public TourGuideProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TourGuideProfileDto?> GetByIdAsync(string userId)
        {
            var profile = await _context.TourGuideProfiles
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Cities)
                .Include(x => x.Languages)
                .Include(x => x.Gallery)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            return profile is null ? null : MapToDto(profile);
        }

        public async Task<TourGuideProfileDto?> UpdateAsync(string userId, UpdateTourGuideProfileDto model)
        {
            var profile = await _context.TourGuideProfiles
                .Include(x => x.User)
                .Include(x => x.Cities)
                .Include(x => x.Languages)
                .Include(x => x.Gallery)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile is null)
                return null;

            if (model.Bio is not null)
                profile.Bio = model.Bio;

            if (model.PricePerDay.HasValue)
                profile.PricePerDay = model.PricePerDay.Value;

            if (model.ProfilePictureUrl is not null)
                profile.ProfilePictureUrl = model.ProfilePictureUrl;

            if (model.Cities is not null)
            {
                profile.Cities.Clear();
                foreach (var city in model.Cities.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile.Cities.Add(new TourGuideCity
                    {
                        CityName = city,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            if (model.Languages is not null)
            {
                profile.Languages.Clear();
                foreach (var language in model.Languages.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile.Languages.Add(new TourGuideLanguage
                    {
                        Language = language,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            if (model.Gallery is not null)
            {
                profile.Gallery.Clear();
                foreach (var image in model.Gallery.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile.Gallery.Add(new TourGuideGallery
                    {
                        ImageUrl = image,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return MapToDto(profile);
        }

        private static TourGuideProfileDto MapToDto(TourGuideProfile profile)
        {
            return new TourGuideProfileDto
            {
                UserId = profile.UserId,
                FirstName = profile.User?.FirstName ?? string.Empty,
                LastName = profile.User?.LastName ?? string.Empty,
                UserName = profile.User?.UserName ?? string.Empty,
                Email = profile.User?.Email ?? string.Empty,
                Country = profile.User?.Country ?? string.Empty,
                WhatsAppNumber = profile.User?.WhatsAppNumber,
                Bio = profile.Bio,
                PricePerDay = profile.PricePerDay,
                Rating = profile.Rating,
                ProfilePictureUrl = profile.ProfilePictureUrl,
                Cities = profile.Cities.Select(x => x.CityName).ToList(),
                Languages = profile.Languages.Select(x => x.Language).ToList(),
                Gallery = profile.Gallery.Select(x => x.ImageUrl).ToList()
            };
        }
    }
}
