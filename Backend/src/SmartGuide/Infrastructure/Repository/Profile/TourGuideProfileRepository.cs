using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Application.Services.UseCases;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Profiles.TourGuide;
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

            string? Picture = null;

            try
            {
                if (model.ProfilePicture != null)
                {
                    await attachmentService.Delete(profile.User.ProfileImage, "profileImages");
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
                profile.User!.ProfileImage = Picture;
            }

            if (model.Cities is not null)
            {
                profile?.Cities?.Clear();

                var existingCities = _context.TourGuideCities
                                             .Where(x => x.TourGuideProfileId == profile.UserId);
                _context.TourGuideCities.RemoveRange(existingCities);


                foreach (var city in model.Cities.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile?.Cities?.Add(new TourGuideCity
                    {
                        CityName = city,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            if (model.Languages is not null)
            {
                profile?.Languages?.Clear();

                var existingLanguages = _context.TourGuideLanguages
                                             .Where(x => x.TourGuideProfileId == profile.UserId);
                _context.TourGuideLanguages.RemoveRange(existingLanguages);


                foreach (var language in model.Languages.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct())
                {
                    profile?.Languages?.Add(new TourGuideLanguage
                    {
                        Language = language,
                        TourGuideProfileId = profile.UserId
                    });
                }
            }

            if (model.Gallery != null && model.Gallery.Any())
            {
                profile?.Gallery?.Clear();
                var existingGallery = _context.TourGuideGallery
                                             .Where(x => x.TourGuideProfileId == profile.UserId);
                _context.TourGuideGallery.RemoveRange(existingGallery);
                foreach (var gallery in existingGallery)
                {
                    await attachmentService.Delete(gallery.ImageUrl, "TourGuidesGallery");
                }


                foreach (var file in model.Gallery)
                {
                    var fileName = await attachmentService.Upload("TourGuidesGallery", file);

                    var galleryImage = new TourGuideGallery
                    {
                        ImageUrl = fileName,
                        TourGuideProfileId = profile?.UserId!
                    };

                    _context.TourGuideGallery.Add(galleryImage);
                }

                await _context.SaveChangesAsync();
            }

            await _context.SaveChangesAsync();
            return MapToDto(profile!);
        }

        private TourGuideProfileDto MapToDto(TourGuideProfile profile)
        {
            // Prefer the profile-specific picture if it exists; fallback to user's profile image.
            var storedProfileImage = profile.ProfilePicture ?? profile.User?.ProfileImage;

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
                ProfilePicture = _imageUrlService.ToPublicImageUrl(
                    storedProfileImage,
                    "profileImages"),
                Cities = profile?.Cities?.Select(x => x.CityName).ToList(),
                Languages = profile?.Languages?.Select(x => x.Language).ToList(),
                Gallery = profile?.Gallery?.Select(x => _imageUrlService.ToPublicImageUrl(x.ImageUrl, "TourGuidesGallery")).ToList()
            };
        }
    }
}
