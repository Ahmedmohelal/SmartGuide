using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public class GuideAdminService : IGuideAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IImageUrlService _imageUrlService;
        private readonly ILogger<GuideAdminService> _logger;

        public GuideAdminService(
            ApplicationDbContext context,
            IEmailService emailService,
            IImageUrlService imageUrlService,
            ILogger<GuideAdminService> logger)
        {
            _context = context;
            _emailService = emailService;
            _imageUrlService = imageUrlService;
            _logger = logger;
        }



        public async Task<List<AdminGuideVerificationDto>> GetPendingGuidesAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.TourGuideProfile)
                .Where(u => u.IsGuideVerified == GuideVerificationStatus.Pending)
                .ToListAsync();

            return users.Select(u => AdminUserMapper.MapToVerificationDto(u, _imageUrlService)).ToList();
        }

        public async Task<List<AdminGuideVerificationDto>> GetAllGuidesAsync()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Include(u => u.TourGuideProfile)
                .Where(u => u.Role == "TourGuide")
                .ToListAsync();

            return users.Select(u => AdminUserMapper.MapToVerificationDto(u, _imageUrlService)).ToList();
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
    }
}
