using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.AuthenticationDTOs
{
    public class GoogleLoginRequestDto
    {
        [Required]
        public string IdToken { get; set; } = string.Empty;
    }
}
