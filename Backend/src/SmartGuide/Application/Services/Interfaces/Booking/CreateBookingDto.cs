using Domain.Entities.Book;
using System.ComponentModel.DataAnnotations;

namespace Application.Services.Interfaces.Booking
{
    public class CreateBookingDto
    {
        [Required]
        public Guid TourId { get; set; }

        [Required]
        public Guid SlotId { get; set; }

        [Required]
        public decimal TotalPrice { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
    }
}