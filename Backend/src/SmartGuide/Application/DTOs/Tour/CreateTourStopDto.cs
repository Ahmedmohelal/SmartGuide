using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Tour
{
    public class CreateTourStopDto
    {
        public int OrderIndex { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        public int? PlaceId { get; set; }

    }
}