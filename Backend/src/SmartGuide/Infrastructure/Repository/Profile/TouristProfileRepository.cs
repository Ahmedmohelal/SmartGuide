using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Application.Services.UseCases;
using Domain.Entities.Profiles.Tourist;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Profile
{
    public class TouristProfileRepository : IProfileRepository<TouristProfileDto, UpdateTouristProfileDto>
    {
        private readonly ApplicationDbContext _context;
        private readonly IAttachmentService attachmentService;
        private readonly IImageUrlService _imageUrlService;

        public TouristProfileRepository(ApplicationDbContext context , IAttachmentService _attachmentService,IImageUrlService imageUrlService)
        {
            _context = context;
            attachmentService = _attachmentService;
            _imageUrlService = imageUrlService;
        }

        public async Task<IReadOnlyList<TouristProfileDto>> GetAllAsync()
        {
            var profiles = await _context.Set<TouristProfile>()
                .AsNoTracking()
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

        public async Task<TouristProfileDto?> GetByIdAsync(string userId)
        {
            var profile = await _context.Set<TouristProfile>()
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile is null)
                return null;

            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Id == userId);
            return MapToDto(profile, user);
        }

        public async Task<TouristProfileDto?> UpdateAsync(string userId, UpdateTouristProfileDto model)
        {
            var profile = await _context.Set<TouristProfile>()
                .FirstOrDefaultAsync(x => x.UserId == userId);

            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);

            if (profile is null || user is null)
                return null;

            if (model.FirstName is not null)
                user.FirstName = model.FirstName;

            if (model.LastName is not null)
                user.LastName = model.LastName;

            if (model.Country is not null)
                user.Country = model.Country;

            if (model.WhatsAppNumber is not null)
                user.WhatsAppNumber = model.WhatsAppNumber;

            if (model.TouristImage != null)
            {
                string? newImage = null;
                try
                {
                    await attachmentService.Delete(user.ProfileImage, "Tourists");
                    newImage = await attachmentService.Upload("Tourists", model.TouristImage);
                    user.ProfileImage = newImage;
                }
                catch (Exception)
                {
                    if (newImage != null)
                        await attachmentService.Delete(newImage, "Tourists");
                }
            }

            await _context.SaveChangesAsync();
            return MapToDto(profile, user);
        }

        private TouristProfileDto MapToDto(TouristProfile profile, ApplicationUser? user)
        {
            return new TouristProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                FirstName = user?.FirstName ?? string.Empty,
                LastName = user?.LastName ?? string.Empty,
                UserName = user?.UserName ?? string.Empty,
                Email = user?.Email ?? string.Empty,
                Country = user?.Country ?? string.Empty,
                WhatsAppNumber = user?.WhatsAppNumber,
                TouristImage = _imageUrlService.ToPublicImageUrl(
                    user?.ProfileImage,
                    "Tourists") 
            };
        }
    }
}
