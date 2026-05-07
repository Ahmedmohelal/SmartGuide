using Domain.Entities.Book;
using System.ComponentModel.DataAnnotations;

namespace Application.DTOs.Booking
{
    public class CreateBookingDto
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        public Guid SlotId { get; set; }

        public List<Guid> SelectedAddOnIds { get; set; } = new();

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }
}