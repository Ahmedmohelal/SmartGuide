using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Tour
{
    public class CreateTourInclusionDto
    {
        [Required]
        public string Description { get; set; }
        [Required]
        public string Type { get; set; }
    }
}