using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class SendResetOtpDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}

