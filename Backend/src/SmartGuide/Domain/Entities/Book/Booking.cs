using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Book
{
    public class Booking
    {
        public Guid Id { get; set; }
        public string GuideId { get; set; }
        public string TouristId { get; set; }
        public Guid TourId { get; set; }
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public Guid SlotId { get; set; }
        public decimal TotalPrice { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

        public BookingSlot Slot { get; set; } = null!;
    }
}
