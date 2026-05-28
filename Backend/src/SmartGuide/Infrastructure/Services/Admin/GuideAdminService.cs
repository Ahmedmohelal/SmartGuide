using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.Notifications;
using Application.Services.Interfaces.PictureMaker;
using Domain.Entities.Notifications;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Enums;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Services.Admin.Specs;
using Infrastructure.Services.Home;
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
        private readonly INotificationService _notificationService;

        public GuideAdminService(
            ApplicationDbContext context,
            IEmailService emailService,
            IImageUrlService imageUrlService,
            IRefreshTokenService refreshTokenService,
            IAdminAuditService auditService,
            ILogger<GuideAdminService> logger,
            INotificationService notificationService)
        {
            _context = context;
            _emailService = emailService;
            _imageUrlService = imageUrlService;
            _refreshTokenService = refreshTokenService;
            _auditService = auditService;
            _logger = logger;
            _notificationService = notificationService;
        }



        public async Task<Pagination<AdminGuideVerificationDto>>GetPendingGuidesAsync(AdminGuideSpecParams param)
        {
            param.VerificationStatus =
                GuideVerificationStatus.Pending
                    .ToString();

            var spec =
                new AdminGuidesSpecification(param);

            var countSpec =
                new AdminGuidesCountSpecification(
                    param);

            var usersQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users
                            .Include(x => x.TourGuideProfile)
                            .AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users.AsQueryable(),
                        countSpec);

            var users = await usersQuery

                .AsNoTracking()
                .Include(u => u.TourGuideProfile)
                .Where(u => u.IsGuideVerified == GuideVerificationStatus.Pending)
                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var mappedUsers = users
                .Select(u =>
                    AdminUserMapper.MapToVerificationDto(
                        u,
                        _imageUrlService))
                .ToList();

            return new Pagination<AdminGuideVerificationDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mappedUsers);
        }

        public async Task<Pagination<AdminGuideVerificationDto>>
    GetAllGuidesAsync(
        AdminGuideSpecParams param)
        {
            var spec =
                new AdminGuidesSpecification(param);

            var countSpec =
                new AdminGuidesCountSpecification(
                    param);

            var usersQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users
                            .Include(x => x.TourGuideProfile)
                            .AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users.AsQueryable(),
                        countSpec);

            var users = await usersQuery

                .AsNoTracking()

                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var mappedUsers = users
                .Select(u =>
                    AdminUserMapper.MapToVerificationDto(
                        u,
                        _imageUrlService))
                .ToList();

            return new Pagination<AdminGuideVerificationDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mappedUsers);
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

            await _notificationService.SendAsync(
                guideId,
                "Account Approved 🎉",
                "Your tour guide account has been approved. You can now create tours!",
                NotificationType.GuideApproved,
                guideId, "Guide");

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

            await _notificationService.SendAsync(
                guideId,
                "Account Not Approved",
                $"Your verification was rejected. Reason: {reason}",
                NotificationType.GuideRejected,
                guideId, "Guide");

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

            await _notificationService.SendAsync(
                guideId,
                "Account Activated ✅",
                "Your account is now active again.",
                NotificationType.AccountActivated,
                guideId, "Guide");

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

            var (notifTitle, notifType) = targetStatus switch
            {
                GuideAccountStatus.Suspended =>
                    ("Account Suspended ⚠️", NotificationType.AccountSuspended),
                GuideAccountStatus.Banned =>
                    ("Account Banned 🚫", NotificationType.AccountBanned),
                GuideAccountStatus.UnderReview =>
                    ("Account Under Review 🔍", NotificationType.AccountUnderReview),
                _ =>
                    ("Account Status Updated", NotificationType.AccountActivated)
            };

            await _notificationService.SendAsync(
                guideId,
                notifTitle,
                $"Reason: {reason}",
                notifType,
                guideId, "Guide");

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
