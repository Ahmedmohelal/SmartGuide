using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideMonthlyEarningsPointDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Earnings { get; set; }
    }
}
