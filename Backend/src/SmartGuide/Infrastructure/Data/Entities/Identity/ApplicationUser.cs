using Infrastructure.Data.Entities.Enums;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Profiles.Tourist;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;


namespace Infrastructure.Data.Entities.Identity
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FirstName { get; set; } = null!;
        [Required]
        public string LastName { get; set; } = null!;
        public string Country { get; set; } = string.Empty;
        public string? WhatsAppNumber { get; set; }
        [Required]
        public string Role { get; set; } = null!;
        public string? GuideLicenseImage { get; set; }
        public string? NationalIdImage { get; set; }
        public GuideVerificationStatus IsGuideVerified { get; set; } = GuideVerificationStatus.Pending;
        public GuideAccountStatus GuideAccountStatus { get; set; } = GuideAccountStatus.Pending;
        public bool ForceLogoutRequired { get; set; }
        public string? ProfileImage { get; set; }
        public string? ResetPasswordOtp { get; set; }
        public DateTime? ResetPasswordOtpExpiry { get; set; }

        public string? FcmToken { get; set; }

        public virtual TouristProfile? TouristProfile { get; set; }
        public virtual TourGuideProfile? TourGuideProfile { get; set; }


    }
}
