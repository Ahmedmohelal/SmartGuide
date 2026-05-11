using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideDashboardResponseDto
    {
        public GuideDashboardStatisticsDto Statistics { get; set; } = new();
        public List<GuideMonthlyEarningsPointDto> MonthlyEarnings { get; set; } = [];
        public List<GuideMonthlyBookingsPointDto> MonthlyBookings { get; set; } = [];
        public List<GuideTourPerformanceDto> MostPopularTours { get; set; } = [];
        public List<GuideTourPerformanceDto> LeastActiveTours { get; set; } = [];
        public List<GuideRecentActivityDto> RecentActivities { get; set; } = [];
    }
}

