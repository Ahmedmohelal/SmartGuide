using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Tour
{
    public class CreateTourAddOnDto
    {
        [Required]
        public string Title { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "Add-on price cannot be negative")]
        public decimal Price { get; set; }
    }
}