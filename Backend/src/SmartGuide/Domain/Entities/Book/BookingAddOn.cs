using System;
using Domain.Entities.Tours;

namespace Domain.Entities.Book
{
    public class BookingAddOn
    {
        public Guid Id { get; set; }
        public Guid BookingId { get; set; }
        public Booking Booking { get; set; } = null!;
        public Guid TourAddOnId { get; set; }
        public TourAddOn TourAddOn { get; set; } = null!;
        public decimal Price { get; set; }
    }
}
