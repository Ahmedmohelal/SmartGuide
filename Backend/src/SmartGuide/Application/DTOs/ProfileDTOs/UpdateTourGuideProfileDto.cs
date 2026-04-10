using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.ProfileDTOs
{
    public class UpdateTourGuideProfileDto
    {
        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Range(0, double.MaxValue)]
        public double? PricePerDay { get; set; }

        public IFormFile? ProfilePicture { get; set; }

        public List<string>? Cities { get; set; }
        public List<string>? Languages { get; set; }
        public List<string>? Gallery { get; set; }
    }
}
