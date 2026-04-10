using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.ProfileDTOs
{
    public class UpdateTouristProfileDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        [MaxLength(100)]
        public string? Country { get; set; }

        [MaxLength(20)]
        [RegularExpression(@"^\+?[0-9\s\-()]{10,20}$", ErrorMessage = "Invalid WhatsApp number format. Use digits, optional + prefix, spaces, hyphens, or parentheses.")]
        public string? WhatsAppNumber { get; set; }

        [Display(Name = "Tourist Image")]
        public IFormFile? TouristImage { get; set; }
    }
}
