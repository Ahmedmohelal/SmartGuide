using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Domain.Entities.Book;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Enums;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases.Admin
{

    public class AdminService : IAdminService
    {
        private readonly IUserService _userService;
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IImageUrlService _imageUrlService;
        private readonly ILogger<AdminService> _logger;

        public AdminService(
            IUserService userService,
            ApplicationDbContext context,
            IEmailService emailService,
            IImageUrlService imageUrlService,
            ILogger<AdminService> logger)
        {
            _userService = userService;
            _context = context;
            _emailService = emailService;
            _imageUrlService = imageUrlService;
            _logger = logger;
        }

        // ==================== Users ====================

        public async Task<List<AdminUserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .ToListAsync();

            return users.Select(u => new AdminUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                UserName = u.UserName ?? string.Empty,
                Country = u.Country,
                Role = u.Role,
                WhatsAppNumber = u.WhatsAppNumber,
                ProfileImage = _imageUrlService.ToPublicImageUrl(u.ProfileImage, "profileImages"),
                GuideLicenseImage = _imageUrlService.ToPublicImageUrl(u.GuideLicenseImage, "licenses"),
                NationalIdImage = _imageUrlService.ToPublicImageUrl(u.NationalIdImage, "nationalIds"),
                VerificationStatus = u.IsGuideVerified.ToString(),
                IsActive = !u.LockoutEnd.HasValue || u.LockoutEnd < DateTimeOffset.UtcNow
            }).ToList();
        }

        public async Task<AdminUserDto?> GetUserByIdAsync(string userId)
        {
            var u = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (u == null) return null;

            return new AdminUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                UserName = u.UserName ?? string.Empty,
                Country = u.Country,
                Role = u.Role,
                WhatsAppNumber = u.WhatsAppNumber,
                ProfileImage = _imageUrlService.ToPublicImageUrl(u.ProfileImage, "profileImages"),
                GuideLicenseImage = _imageUrlService.ToPublicImageUrl(u.GuideLicenseImage, "licenses"),
                NationalIdImage = _imageUrlService.ToPublicImageUrl(u.NationalIdImage, "nationalIds"),
                VerificationStatus = u.IsGuideVerified.ToString(),
                IsActive = !u.LockoutEnd.HasValue || u.LockoutEnd < DateTimeOffset.UtcNow
            };
        }

        public async Task<OperationResultDto> DeactivateUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "User not found." };

            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            user.LockoutEnabled = true;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "User deactivated successfully." };
        }

        public async Task<OperationResultDto> ActivateUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "User not found." };

            user.LockoutEnd = null;
            user.LockoutEnabled = false;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "User activated successfully." };
        }

        public async Task<OperationResultDto> DeleteUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "User not found." };

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "User deleted successfully." };
        }

        // ==================== Guide Verification ====================

        public async Task<List<AdminGuideVerificationDto>> GetPendingGuidesAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.TourGuideProfile)
                .Where(u => u.IsGuideVerified == GuideVerificationStatus.Pending)
                .ToListAsync();

            return users.Select(u => MapToVerificationDto(u)).ToList();
        }

        public async Task<List<AdminGuideVerificationDto>> GetAllGuidesAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.TourGuideProfile)
                .Where(u => u.Role == "TourGuide")
                .ToListAsync();

            return users.Select(u => MapToVerificationDto(u)).ToList();
        }

        public async Task<OperationResultDto> ApproveGuideAsync(string guideId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == guideId);

            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            if (user.Role != "TourGuide")
                return new OperationResultDto { IsSuccess = false, Message = "User is not a tour guide." };

            user.IsGuideVerified = GuideVerificationStatus.Verified;
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendEmailAsync(
                    user.Email!,
                    "SmartGuide - Your account has been approved! 🎉",
                    $"""
                <h2>Congratulations {user.FirstName}!</h2>
                <p>Your tour guide account has been <strong>approved</strong>.</p>
                <p>You can now:</p>
                <ul>
                    <li>Create and manage your tours</li>
                    <li>Add available time slots</li>
                    <li>Start receiving bookings from tourists</li>
                </ul>
                <p>Welcome to SmartGuide! 🌟</p>
                """);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send approval email to {Email}", user.Email);
            }

            return new OperationResultDto { IsSuccess = true, Message = "Guide approved successfully." };
        }

        public async Task<OperationResultDto> RejectGuideAsync(string guideId, string reason)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == guideId);

            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            if (user.Role != "TourGuide")
                return new OperationResultDto { IsSuccess = false, Message = "User is not a tour guide." };

            user.IsGuideVerified = GuideVerificationStatus.Rejected;
            await _context.SaveChangesAsync();

            try
            {
                await _emailService.SendEmailAsync(
                    user.Email!,
                    "SmartGuide - Account Verification Update",
                    $"""
                <h2>Hello {user.FirstName},</h2>
                <p>Unfortunately, your tour guide account verification was <strong>not approved</strong>.</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p>You can update your documents and resubmit for verification.</p>
                <p>If you have any questions, please contact our support team.</p>
                """);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send rejection email to {Email}", user.Email);
            }

            return new OperationResultDto { IsSuccess = true, Message = "Guide rejected successfully." };
        }

        // ==================== Tours ====================

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

        // ==================== Bookings ====================

        public async Task<List<AdminBookingDto>> GetAllBookingsAsync(
            string? status = null, string? guideId = null)
        {
            var query = _context.Bookings
                .AsNoTracking()
                .Include(b => b.Slot)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status) &&
                Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
            {
                query = query.Where(b => b.Status == bookingStatus);
            }

            if (!string.IsNullOrWhiteSpace(guideId))
            {
                query = query.Where(b => b.GuideId == guideId);
            }

            var bookings = await query.ToListAsync();

            var userIds = bookings.Select(b => b.TouristId)
                .Concat(bookings.Select(b => b.GuideId))
                .Distinct()
                .ToList();

            var users = await _context.Users
                .AsNoTracking()
                .Where(u => userIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var tourIds = bookings.Select(b => b.TourId).Distinct().ToList();
            var tours = await _context.Tours
                .AsNoTracking()
                .Where(t => tourIds.Contains(t.Id))
                .ToDictionaryAsync(t => t.Id);

            return bookings.Select(b =>
            {
                users.TryGetValue(b.TouristId, out var tourist);
                users.TryGetValue(b.GuideId, out var guide);
                tours.TryGetValue(b.TourId, out var tour);

                return new AdminBookingDto
                {
                    Id = b.Id,
                    TouristId = b.TouristId,
                    TouristName = tourist != null
                        ? $"{tourist.FirstName} {tourist.LastName}"
                        : "Unknown",
                    TouristEmail = tourist?.Email ?? string.Empty,
                    GuideId = b.GuideId,
                    GuideName = guide != null
                        ? $"{guide.FirstName} {guide.LastName}"
                        : "Unknown",
                    TourId = b.TourId,
                    TourTitle = tour?.Title ?? "Unknown",
                    Status = b.Status.ToString(),
                    TotalPrice = b.TotalPrice,
                    PaymentMethod = b.PaymentMethod.ToString(),
                    CreatedAtUtc = b.CreatedAtUtc,
                    SlotDate = b.Slot.Date,
                    SlotStartTime = b.Slot.StartTime,
                    SlotEndTime = b.Slot.EndTime
                };
            }).ToList();
        }

        // ==================== Statistics ====================

        public async Task<AdminStatisticsDto> GetStatisticsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalTourists = await _context.Users
                .CountAsync(u => u.Role == "Tourist");
            var totalGuides = await _context.Users
                .CountAsync(u => u.Role == "TourGuide");
            var pendingVerifications = await _context.Users
                .CountAsync(u => u.IsGuideVerified == GuideVerificationStatus.Pending);
            var totalTours = await _context.Tours.CountAsync();
            var activeTours = await _context.Tours.CountAsync(t => t.IsActive);
            var totalBookings = await _context.Bookings.CountAsync();
            var pendingBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Pending);
            var confirmedBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Confirmed);
            var cancelledBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Cancelled);
            var totalRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed)
                .SumAsync(b => b.TotalPrice);
            var onlineRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed &&
                            b.PaymentMethod == PaymentMethod.Online)
                .SumAsync(b => b.TotalPrice);
            var cashRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed &&
                            b.PaymentMethod == PaymentMethod.Cash)
                .SumAsync(b => b.TotalPrice);

            return new AdminStatisticsDto
            {
                TotalUsers = totalUsers,
                TotalTourists = totalTourists,
                TotalTourGuides = totalGuides,
                PendingVerifications = pendingVerifications,
                TotalTours = totalTours,
                ActiveTours = activeTours,
                TotalBookings = totalBookings,
                PendingBookings = pendingBookings,
                ConfirmedBookings = confirmedBookings,
                CancelledBookings = cancelledBookings,
                TotalRevenue = totalRevenue,
                OnlineRevenue = onlineRevenue,
                CashRevenue = cashRevenue
            };
        }

        // ==================== Revenue ====================

        public async Task<AdminRevenueDto> GetRevenueAsync()
        {
            var confirmedBookings = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Status == BookingStatus.Confirmed)
                .ToListAsync();

            var totalRevenue = confirmedBookings.Sum(b => b.TotalPrice);
            var onlineRevenue = confirmedBookings
                .Where(b => b.PaymentMethod == PaymentMethod.Online)
                .Sum(b => b.TotalPrice);
            var cashRevenue = confirmedBookings
                .Where(b => b.PaymentMethod == PaymentMethod.Cash)
                .Sum(b => b.TotalPrice);

            var guideIds = confirmedBookings
                .Select(b => b.GuideId)
                .Distinct()
                .ToList();

            var guides = await _context.Users
                .AsNoTracking()
                .Where(u => guideIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var revenuePerGuide = confirmedBookings
                .GroupBy(b => b.GuideId)
                .Select(g =>
                {
                    guides.TryGetValue(g.Key, out var guide);
                    return new GuideRevenueDto
                    {
                        GuideId = g.Key,
                        GuideName = guide != null
                            ? $"{guide.FirstName} {guide.LastName}"
                            : "Unknown",
                        TotalRevenue = g.Sum(b => b.TotalPrice),
                        TotalBookings = g.Count()
                    };
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToList();

            return new AdminRevenueDto
            {
                TotalRevenue = totalRevenue,
                OnlineRevenue = onlineRevenue,
                CashRevenue = cashRevenue,
                RevenuePerGuide = revenuePerGuide
            };
        }
        private AdminGuideVerificationDto MapToVerificationDto(ApplicationUser u)
        {
            return new AdminGuideVerificationDto
            {
                UserId = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                WhatsAppNumber = u.WhatsAppNumber,

                GuideLicenseImage = _imageUrlService.ToPublicImageUrl(
                    u.GuideLicenseImage,
                    "licenses"),

                NationalIdImage = _imageUrlService.ToPublicImageUrl(
                    u.NationalIdImage,
                    "nationalIds"),

                ProfileImage = _imageUrlService.ToPublicImageUrl(
                    u.ProfileImage,
                    "profileImages"),

                VerificationStatus = u.IsGuideVerified.ToString(),

                Bio = u.TourGuideProfile?.Bio,

                Country = u.Country
            };
        }
    }
}
