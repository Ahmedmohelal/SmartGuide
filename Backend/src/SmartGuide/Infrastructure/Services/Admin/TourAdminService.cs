using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public class TourAdminService:ITourAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageUrlService _imageUrlService;

        public TourAdminService(
            ApplicationDbContext context,
            IImageUrlService imageUrlService
          )
        {
            _context = context;
            _imageUrlService = imageUrlService;
        }
        public async Task<List<AdminTourDto>> GetAllToursAsync()
        {
            var tours = await _context.Tours
                .AsNoTracking()
                .Include(t => t.TourImages)
                .ToListAsync();

            var guideIds = tours.Select(t => t.GuideId).Distinct().ToList();
            var guides = await _context.Users
                .AsNoTracking()
                .Where(u => guideIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var bookingCounts = await _context.Bookings
                .AsNoTracking()
                .GroupBy(b => b.TourId)
                .Select(g => new { TourId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.TourId, x => x.Count);

            return tours.Select(t =>
            {
                guides.TryGetValue(t.GuideId, out var guide);
                bookingCounts.TryGetValue(t.Id, out var bookingCount);

                return new AdminTourDto
                {
                    Id = t.Id,
                    GuideId = t.GuideId,
                    GuideName = guide != null
                        ? $"{guide.FirstName} {guide.LastName}"
                        : "Unknown",
                    Title = t.Title,
                    Price = t.Price,
                    DurationHours = t.DurationHours,
                    IsActive = t.IsActive,
                    PrimaryImage = _imageUrlService.ToPublicImageUrl(
                        t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                        $"ToursImages/{t.Id}"),
                    TotalBookings = bookingCount
                };
            }).ToList();
        }

        public async Task<OperationResultDto> DeactivateTourAsync(Guid tourId)
        {
            var tour = await _context.Tours.FirstOrDefaultAsync(x => x.Id == tourId);
            if (tour == null)
                return new OperationResultDto { IsSuccess = false, Message = "Tour not found." };

            tour.IsActive = false;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "Tour deactivated successfully." };
        }

        public async Task<OperationResultDto> ActivateTourAsync(Guid tourId)
        {
            var tour = await _context.Tours.FirstOrDefaultAsync(x => x.Id == tourId);
            if (tour == null)
                return new OperationResultDto { IsSuccess = false, Message = "Tour not found." };

            tour.IsActive = true;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "Tour activated successfully." };
        }

        public async Task<OperationResultDto> DeleteTourAsync(Guid tourId)
        {
            var tour = await _context.Tours.FirstOrDefaultAsync(x => x.Id == tourId);
            if (tour == null)
                return new OperationResultDto { IsSuccess = false, Message = "Tour not found." };

            tour.IsActive = false;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "Tour deleted successfully." };
        }
    }
}
