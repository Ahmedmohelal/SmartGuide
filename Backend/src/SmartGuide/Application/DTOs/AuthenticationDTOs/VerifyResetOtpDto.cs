using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.AuthenticationDTOs
{
    public class VerifyResetOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^\d{6}$")]
        public string Otp { get; set; } = string.Empty;
    }
}

