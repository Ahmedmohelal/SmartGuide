using Application.DTOs.ProfileDTOs;
using Application.Services.Interfaces;
using Application.Services.UseCases;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Profiles.Tourist;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Profile
{
    public class TouristProfileRepository : IProfileRepository<TouristProfileDto, UpdateTouristProfileDto>
    {
        private readonly ApplicationDbContext _context;
        private readonly IAttachmentService attachmentService;

        public TouristProfileRepository(ApplicationDbContext context , IAttachmentService _attachmentService)
        {
            _context = context;
            attachmentService = _attachmentService;
        }

        public async Task<TouristProfileDto?> GetByIdAsync(string userId)
        {
            var profile = await _context.Set<TouristProfile>()
                .AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            return profile is null ? null : MapToDto(profile);
        }

        public async Task<TouristProfileDto?> UpdateAsync(string userId, UpdateTouristProfileDto model)
        {
            var profile = await _context.Set<TouristProfile>()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile is null || profile.User is null)
                return null;

            if (model.FirstName is not null)
                profile.User.FirstName = model.FirstName;

            if (model.LastName is not null)
                profile.User.LastName = model.LastName;

            if (model.Country is not null)
                profile.User.Country = model.Country;

            if (model.WhatsAppNumber is not null)
                profile.User.WhatsAppNumber = model.WhatsAppNumber;

            string? TouristImage = null;
            try
            {
                if(model.TouristImage != null)
                TouristImage = await attachmentService.Upload("Tourists", model.TouristImage);
            }
            catch (Exception)
            {
                if (TouristImage != null)
                    await attachmentService.Delete(TouristImage, "Tourists");
            }
            if(TouristImage != null)
                profile.User.ProfileImage = TouristImage;

            await _context.SaveChangesAsync();
            return MapToDto(profile);
        }

        private static TouristProfileDto MapToDto(TouristProfile profile)
        {
            return new TouristProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                FirstName = profile.User?.FirstName ?? string.Empty,
                LastName = profile.User?.LastName ?? string.Empty,
                UserName = profile.User?.UserName ?? string.Empty,
                Email = profile.User?.Email ?? string.Empty,
                Country = profile.User?.Country ?? string.Empty,
                WhatsAppNumber = profile.User?.WhatsAppNumber,
                TouristImage = profile.User?.ProfileImage
            };
        }
    }
}
