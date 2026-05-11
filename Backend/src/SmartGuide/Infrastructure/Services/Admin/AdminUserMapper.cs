using Application.DTOs.AdminDashboard;
using Application.Services.Interfaces.PictureMaker;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Services.Files;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public static class AdminUserMapper
    {
        public static AdminGuideVerificationDto MapToVerificationDto(ApplicationUser u, IImageUrlService imageUrlService)
        {
            return new AdminGuideVerificationDto
            {
                UserId = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                WhatsAppNumber = u.WhatsAppNumber,

                GuideLicenseImage = imageUrlService.ToPublicImageUrl(
                    u.GuideLicenseImage,
                    "licenses"),

                NationalIdImage = imageUrlService.ToPublicImageUrl(
                    u.NationalIdImage,
                    "nationalIds"),

                ProfileImage = imageUrlService.ToPublicImageUrl(
                    u.ProfileImage,
                    "profileImages"),

                VerificationStatus = u.IsGuideVerified.ToString(),

                GuideAccountStatus = u.GuideAccountStatus.ToString(),

                Bio = u.TourGuideProfile?.Bio,

                Country = u.Country
            };
        }
    }
}
