using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideDashboardStatisticsDto
    {
        public decimal WalletBalance { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal PendingEarnings { get; set; }
        public int TotalTours { get; set; }
        public int ActiveTours { get; set; }
        public int InactiveTours { get; set; }
        public int UpcomingTours { get; set; }
        public int CancelledTours { get; set; }
        public int CompletedTours { get; set; }
        public int TotalTouristsServed { get; set; }
        public int TotalUniqueTourists { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int PendingWithdrawals { get; set; }
        public string VerificationStatus { get; set; } = string.Empty;
        public string AccountStatus { get; set; } = string.Empty;
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public bool ReviewsDataAvailable { get; set; }
    }
}
