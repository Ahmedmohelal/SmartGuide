using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.Notifications;
using Application.Services.Interfaces.PictureMaker;
using Domain.Entities.Notifications;
using Domain.Entities.Tours;
using Infrastructure.Data;
using Infrastructure.Services.Admin.Specs;
using Infrastructure.Services.Home;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public class TourAdminService : ITourAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IImageUrlService _imageUrlService;
        private readonly INotificationService _notificationService;

        public TourAdminService(
            ApplicationDbContext context,
            IImageUrlService imageUrlService,
            INotificationService notificationService)
        {
            _context = context;
            _imageUrlService = imageUrlService;
            _notificationService = notificationService;
        }
        public async Task<Pagination<AdminTourDto>>
    GetAllToursAsync(AdminTourSpecParams param)
        {
            var spec =
                new AdminToursSpecification(
                    param);

            var countSpec =
                new AdminToursCountSpecification(
                    param);

            var toursQuery =
                SpecificationEvaluator<Tour>
                    .GetQuery(
                        _context.Tours
                            .Include(t => t.TourImages)
                            .AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<Tour>
                    .GetQuery(
                        _context.Tours.AsQueryable(),
                        countSpec);

            var tours = await toursQuery

                .AsNoTracking()

                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var guideIds = tours

                .Select(t => t.GuideId)

                .Distinct()

                .ToList();

            var guides = await _context.Users

                .AsNoTracking()

                .Where(x => guideIds.Contains(x.Id))

                .ToDictionaryAsync(x => x.Id);

            var mappedTours = tours
                .Select(t =>
                {
                    guides.TryGetValue(
                        t.GuideId,
                        out var guide);

                    return new AdminTourDto
                    {
                        Id = t.Id,

                        Title = t.Title,


                        Price = t.Price,

                        DurationHours = t.DurationHours,

                        MaxGroupSize = t.MaxGroupSize,
                        PrimaryImage = _imageUrlService.ToPublicImageUrl(
                    t.TourImages.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
                    $"ToursImages/{t.Id}"
                        ) ?? string.Empty,
                        IsActive = t.IsActive,

                        GuideId = t.GuideId,
                        GuideName = guide != null
                            ? $"{guide.FirstName} {guide.LastName}"
                            : "Unknown",
                    };

                }).ToList();

            return new Pagination<AdminTourDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mappedTours);
        }

        public async Task<OperationResultDto> DeactivateTourAsync(Guid tourId)
        {
            var tour = await _context.Tours.FirstOrDefaultAsync(x => x.Id == tourId);
            if (tour == null)
                return new OperationResultDto { IsSuccess = false, Message = "Tour not found." };

            tour.IsActive = false;
            await _context.SaveChangesAsync();

            await _notificationService.SendAsync(
                tour.GuideId,
                "Tour Deactivated ⚠️",
                $"Your tour \"{tour.Title}\" has been deactivated by the administrator.",
                NotificationType.TourDeactivated,
                tour.Id.ToString(), "Tour");

            return new OperationResultDto { IsSuccess = true, Message = "Tour deactivated successfully." };
        }

        public async Task<OperationResultDto> ActivateTourAsync(Guid tourId)
        {
            var tour = await _context.Tours.FirstOrDefaultAsync(x => x.Id == tourId);
            if (tour == null)
                return new OperationResultDto { IsSuccess = false, Message = "Tour not found." };

            tour.IsActive = true;
            await _context.SaveChangesAsync();

            await _notificationService.SendAsync(
                tour.GuideId,
                "Tour Activated ✅",
                $"Your tour \"{tour.Title}\" has been activated.",
                NotificationType.TourActivated,
                tour.Id.ToString(), "Tour");

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
