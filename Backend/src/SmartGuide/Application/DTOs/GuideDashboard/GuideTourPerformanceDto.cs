using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideTourPerformanceDto
    {
        public Guid TourId { get; set; }
        public string Title { get; set; } = string.Empty;
        public int TotalBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal Revenue { get; set; }
        public double OccupancyRate { get; set; }
    }
}
