using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminStatisticsDto
    {
        public int TotalUsers { get; set; }
        public int TotalTourists { get; set; }
        public int TotalTourGuides { get; set; }
        public int PendingVerifications { get; set; }
        public int TotalTours { get; set; }
        public int ActiveTours { get; set; }
        public int TotalBookings { get; set; }
        public int PendingBookings { get; set; }
        public int ConfirmedBookings { get; set; }
        public int CancelledBookings { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal OnlineRevenue { get; set; }
        public decimal CashRevenue { get; set; }
    }
}
