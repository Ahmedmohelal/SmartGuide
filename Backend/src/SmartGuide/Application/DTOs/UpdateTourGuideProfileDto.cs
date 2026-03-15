using System.ComponentModel.DataAnnotations;

namespace Application.DTOs
{
    public class UpdateTourGuideProfileDto
    {
        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Range(0, double.MaxValue)]
        public double? PricePerDay { get; set; }

        [MaxLength(500)]
        public string? ProfilePictureUrl { get; set; }

        public List<string>? Cities { get; set; }
        public List<string>? Languages { get; set; }
        public List<string>? Gallery { get; set; }
    }
}
