using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminRevenueDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal OnlineRevenue { get; set; }
        public decimal CashRevenue { get; set; }
        public List<GuideRevenueDto> RevenuePerGuide { get; set; } = new();
    }
}

