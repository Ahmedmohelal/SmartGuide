using Application.Helper;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Booking
{
    public class CreateBookingSlotDto
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        [Range(1, 50, ErrorMessage = "Capacity must be between 1 and 50")]
        public int Capacity { get; set; }
    }
}