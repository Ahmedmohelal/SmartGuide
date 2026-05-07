using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminBookingDto
    {
        public Guid Id { get; set; }
        public string TouristId { get; set; }
        public string TouristName { get; set; }
        public string TouristEmail { get; set; }
        public string GuideId { get; set; }
        public string GuideName { get; set; }
        public Guid TourId { get; set; }
        public string TourTitle { get; set; }
        public string Status { get; set; }
        public decimal TotalPrice { get; set; }
        public string PaymentMethod { get; set; }
        public DateTime CreatedAtUtc { get; set; }
        public DateOnly SlotDate { get; set; }
        public TimeOnly SlotStartTime { get; set; }
        public TimeOnly SlotEndTime { get; set; }
    }
}
