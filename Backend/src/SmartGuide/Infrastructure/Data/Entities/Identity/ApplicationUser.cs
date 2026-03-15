using Infrastructure.Data.Entities.Enums;
using Infrastructure.Data.Entities.Profiles.TourGuide;
using Infrastructure.Data.Entities.Profiles.Tourist;
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
        public GuideVerificationStatus IsGuideVerified { get; set; } = GuideVerificationStatus.NotVerified;
        public string? ResetPasswordOtp { get; set; }
        public DateTime? ResetPasswordOtpExpiry { get; set; }

        public virtual TouristProfile? TouristProfile { get; set; }
        public virtual TourGuideProfile? TourGuideProfile { get; set; }


    }
}
