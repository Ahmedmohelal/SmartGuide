using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.AuthenticationDTOs
{
    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }
}
