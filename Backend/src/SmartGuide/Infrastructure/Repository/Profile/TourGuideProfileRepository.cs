using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Domain.Entities.Profiles.TourGuide;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Profile
{
    public class TourGuideProfileRepository : IProfileRepository<TourGuideProfileDto, UpdateTourGuideProfileDto>
    {
        private readonly ApplicationDbContext _context;
        private readonly IAttachmentService attachmentService;
        private readonly IImageUrlService _imageUrlService;

        public TourGuideProfileRepository(ApplicationDbContext context, IAttachmentService _attachmentService, IImageUrlService imageUrlService)
        {
            _context = context;
            attachmentService = _attachmentService;
            _imageUrlService = imageUrlService;
        }

        public async Task<IReadOnlyList<TourGuideProfileDto>> GetAllAsync()
        {
            var profiles = await _context.TourGuideProfiles
                .AsNoTracking()
                .Include(x => x.Cities)
                .Include(x => x.Languages)
                .Include(x => x.Gallery)
                .ToListAsync();

            var users = await _context.Users
                .AsNoTracking()
                .Where(x => profiles.Select(p => p.UserId).Contains(x.Id))
                .ToDictionaryAsync(x => x.Id);

            return profiles.Select(profile =>
            {
                users.TryGetValue(profile.UserId, out var user);
                return MapToDto(profile, user);
            }).ToList();
        }

        public async Task<TourGuideProfileDto?> GetByIdAsync(string userId)
        {
            var profile = await _context.TourGuideProfiles
                .AsNoTracking()
                .Include(x => x.Cities)
                .Include(x => x.Languages)
                .Include(x => x.Gallery)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile is null)
                return null;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
            return MapToDto(profile, user);
        }

        public async Task<TourGuideProfileDto?> UpdateAsync(string userId, UpdateTourGuideProfileDto model)
        {
            var profile = await _context.TourGuideProfiles
                .Include(x => x.Cities)
                .Include(x => x.Languages)
                .Include(x => x.Gallery)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (profile is null || user is null)
                return null;

            if (model.Bio is not null)
                profile.Bio = model.Bio;

            if (model.PricePerDay.HasValue)
                profile.PricePerDay = model.PricePerDay.Value;

            if (model.FirstName is not null)
                user.FirstName = model.FirstName;

            if (model.LastName is not null)
                user.LastName = model.LastName;

            if (model.Country is not null)
                user.Country = model.Country;

            if (model.WhatsAppNumber is not null)
                user.WhatsAppNumber = model.WhatsAppNumber;

            string? Picture = null;

            try
            {
                if (model.ProfilePicture != null)
                {
                    await attachmentService.Delete(user.ProfileImage, "profileImages");
                    Picture = await attachmentService.Upload("profileImages", model.ProfilePicture);
                }
            }
            catch (Exception)
            {
                if (Picture is not null)
                    await attachmentService.Delete(Picture, "profileImages");
            }

            if (Picture is not null)
            {
                profile.ProfilePicture = Picture;
                user.ProfileImage = Picture;
            }

            // Cities
            if (model.Cities is not null)
            {
                profile.Cities ??= new List<TourGuideCity>();
                profile.Cities.Clear();

                var existingCities = _context.TourGuideCities
                    .Where(x => x.TourGuideProfileId == profile.UserId);
                _context.TourGuideCities.RemoveRange(existingCities);

                foreach (var city in model.Cities.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile.Cities.Add(new TourGuideCity
                    {
                        CityName = city,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            // Languages
            if (model.Languages is not null)
            {
                profile.Languages ??= new List<TourGuideLanguage>();
                profile.Languages.Clear();

                var existingLanguages = _context.TourGuideLanguages
                    .Where(x => x.TourGuideProfileId == profile.UserId);
                _context.TourGuideLanguages.RemoveRange(existingLanguages);

                foreach (var language in model.Languages.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile.Languages.Add(new TourGuideLanguage
                    {
                        Language = language,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            // Gallery
            if (model.Gallery != null && model.Gallery.Any())
            {
                profile.Gallery ??= new List<TourGuideGallery>();

                var existingGallery = _context.TourGuideGallery
                    .Where(x => x.TourGuideProfileId == profile.UserId)
                    .ToList();

                foreach (var item in existingGallery)
                {
                    await attachmentService.Delete(item.ImageUrl, "TourGuidesGallery");
                }

                _context.TourGuideGallery.RemoveRange(existingGallery);
                profile.Gallery.Clear();

                foreach (var file in model.Gallery)
                {
                    var fileName = await attachmentService.Upload("TourGuidesGallery", file);

                    var galleryImage = new TourGuideGallery
                    {
                        ImageUrl = fileName,
                        TourGuideProfileId = profile.UserId
                    };

                    _context.TourGuideGallery.Add(galleryImage);
                }
            }

            await _context.SaveChangesAsync();
            return MapToDto(profile, user);
        }

        private TourGuideProfileDto MapToDto(TourGuideProfile profile, ApplicationUser? user)
        {
            var storedProfileImage = profile.ProfilePicture ?? user?.ProfileImage;

            return new TourGuideProfileDto
            {
                UserId = profile.UserId,
                FirstName = user?.FirstName ?? string.Empty,
                LastName = user?.LastName ?? string.Empty,
                UserName = user?.UserName ?? string.Empty,
                Email = user?.Email ?? string.Empty,
                Country = user?.Country ?? string.Empty,
                WhatsAppNumber = user?.WhatsAppNumber,
                Bio = profile.Bio,
                PricePerDay = profile.PricePerDay,
                Rating = profile.Rating,

                ProfilePicture = _imageUrlService.ToPublicImageUrl(
                    storedProfileImage,
                    "profileImages"),

                Cities = profile.Cities?.Select(x => x.CityName).ToList() ?? new List<string>(),
                Languages = profile.Languages?.Select(x => x.Language).ToList() ?? new List<string>(),

                Gallery = profile.Gallery?
                    .Select(x => _imageUrlService.ToPublicImageUrl(x.ImageUrl, "TourGuidesGallery"))
                    .ToList() ?? new List<string>()
            };
        }
    }
}