using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Data.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Admin
{
    public class GuideAdminService : IGuideAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IImageUrlService _imageUrlService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IAdminAuditService _auditService;
        private readonly ILogger<GuideAdminService> _logger;

        public GuideAdminService(
            ApplicationDbContext context,
            IEmailService emailService,
            IImageUrlService imageUrlService,
            IRefreshTokenService refreshTokenService,
            IAdminAuditService auditService,
            ILogger<GuideAdminService> logger)
        {
            _context = context;
            _emailService = emailService;
            _imageUrlService = imageUrlService;
            _refreshTokenService = refreshTokenService;
            _auditService = auditService;
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
            user.GuideAccountStatus = GuideAccountStatus.Active;
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
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == guideId);

            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            if (user.Role != "TourGuide")
                return new OperationResultDto { IsSuccess = false, Message = "User is not a tour guide." };

            user.IsGuideVerified = GuideVerificationStatus.Rejected;
            user.GuideAccountStatus = GuideAccountStatus.Rejected;
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
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

        public async Task<OperationResultDto> ActivateGuideAsync(string guideId, string adminId, string reason, string? ipAddress)
        {
            var user = await GetGuideAsync(guideId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            if (user.IsGuideVerified != GuideVerificationStatus.Verified)
                return new OperationResultDto { IsSuccess = false, Message = "Guide must be verified before activation." };

            user.GuideAccountStatus = GuideAccountStatus.Active;
            user.LockoutEnabled = false;
            user.LockoutEnd = null;
            user.ForceLogoutRequired = false;
            await _context.SaveChangesAsync();

            await _auditService.WriteAsync(adminId, "ActivateGuide", "Guide", user.Id, reason, ipAddress);

            return new OperationResultDto { IsSuccess = true, Message = "Guide activated successfully." };
        }

        public async Task<OperationResultDto> SuspendGuideAsync(string guideId, string adminId, string reason, string? ipAddress)
        {
            return await ChangeGuideAccessStateAsync(guideId, adminId, reason, ipAddress, GuideAccountStatus.Suspended, "SuspendGuide");
        }

        public async Task<OperationResultDto> BanGuideAsync(string guideId, string adminId, string reason, string? ipAddress)
        {
            return await ChangeGuideAccessStateAsync(guideId, adminId, reason, ipAddress, GuideAccountStatus.Banned, "BanGuide");
        }

        public async Task<OperationResultDto> PutUnderReviewAsync(string guideId, string adminId, string reason, string? ipAddress)
        {
            return await ChangeGuideAccessStateAsync(guideId, adminId, reason, ipAddress, GuideAccountStatus.UnderReview, "PutGuideUnderReview");
        }

        public async Task<OperationResultDto> ForceLogoutGuideAsync(string guideId, string adminId, string reason, string? ipAddress)
        {
            var user = await GetGuideAsync(guideId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            await _refreshTokenService.RevokeAllUserTokensAsync(guideId, CancellationToken.None);
            user.ForceLogoutRequired = true;
            await _context.SaveChangesAsync();

            await _auditService.WriteAsync(adminId, "ForceLogoutGuide", "Guide", user.Id, reason, ipAddress);
            return new OperationResultDto { IsSuccess = true, Message = "Guide logged out from all sessions." };
        }

        private async Task<OperationResultDto> ChangeGuideAccessStateAsync(
            string guideId,
            string adminId,
            string reason,
            string? ipAddress,
            GuideAccountStatus targetStatus,
            string action)
        {
            var user = await GetGuideAsync(guideId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "Guide not found." };

            user.GuideAccountStatus = targetStatus;
            user.ForceLogoutRequired = true;
            user.LockoutEnabled = true;
            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            await _context.SaveChangesAsync();
            await _refreshTokenService.RevokeAllUserTokensAsync(guideId, CancellationToken.None);

            await _auditService.WriteAsync(adminId, action, "Guide", user.Id, reason, ipAddress);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = $"Guide status updated to {targetStatus}."
            };
        }

        private async Task<ApplicationUser?> GetGuideAsync(string guideId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == guideId);
            if (user == null || user.Role != "TourGuide")
            {
                return null;
            }

            return user;
        }
        public async Task<GuideDocumentsDto?> GetGuideDocumentsAsync(string guideId)
        {
            var guide = await _context.Users
                .FirstOrDefaultAsync(g => g.Id == guideId && g.Role == "TourGuide");

            if (guide == null)
                return null;

            return new GuideDocumentsDto
            {
                GuideId = guide.Id,
                FullName = $"{guide.FirstName} {guide.LastName}",
                Email = guide.Email,
                NationalIdImageUrl = _imageUrlService.ToPublicImageUrl(guide.NationalIdImage, "nationalIds"),
                LicenseImageUrl = _imageUrlService.ToPublicImageUrl(guide.GuideLicenseImage, "licenses"),
                Status = guide.IsGuideVerified.ToString()
            };
        }
    }
}
