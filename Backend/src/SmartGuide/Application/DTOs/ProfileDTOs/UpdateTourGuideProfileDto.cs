using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.ProfileDTOs
{
    public class UpdateTourGuideProfileDto
    {
        [MaxLength(100)]
        public string? FirstName { get; set; }

        [MaxLength(100)]
        public string? LastName { get; set; }

        public string? Country { get; set; }

        public string? WhatsAppNumber { get; set; }

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Range(typeof(decimal), "0", "79228162514264337593543950335")]
        public decimal? PricePerDay { get; set; }

        public IFormFile? ProfilePicture { get; set; }

        public List<string>? Cities { get; set; }
        public List<string>? Languages { get; set; }
        public List<IFormFile>? Gallery { get; set; }
    }
}