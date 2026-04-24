using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Tour
{
    public class CreateTourImageDto
    {
        [Required]
        public IFormFile? Image { get; set; }
        public bool IsPrimary { get; set; }
        public int OrderIndex { get; set; }
    }
}