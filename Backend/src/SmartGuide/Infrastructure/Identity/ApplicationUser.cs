using Infrastructure.Data.Entities.Enums;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;


namespace Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser
    {
        [Required]
        public string FirstName { get; set; } = null!;
        [Required]
        public string LastName { get; set; } = null!;
        public string Country { get; set; }
        public string? WhatsAppNumber { get; set; }


        [Required]
        public string Role { get; set; } = null!;
        public string? GuideLicenseImage { get; set; }

        public string? NationalIdImage { get; set; }
        public GuideVerificationStatus IsGuideVerified { get; set; } = GuideVerificationStatus.NotVerified;

        public string? ResetPasswordOtp { get; set; }
        public DateTime? ResetPasswordOtpExpiry { get; set; }

        /// <summary>
        /// Optional WhatsApp number for contact (e.g. E.164 format).
        /// </summary>
    }
}
