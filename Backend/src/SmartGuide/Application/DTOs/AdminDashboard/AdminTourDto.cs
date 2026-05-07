using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminTourDto
    {
        public Guid Id { get; set; }
        public string GuideId { get; set; }
        public string GuideName { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public int DurationHours { get; set; }
        public bool IsActive { get; set; }
        public string? PrimaryImage { get; set; }
        public int TotalBookings { get; set; }
    }
}
