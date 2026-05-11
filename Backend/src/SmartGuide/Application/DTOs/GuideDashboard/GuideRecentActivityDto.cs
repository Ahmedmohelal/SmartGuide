using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideRecentActivityDto
    {
        public DateTime OccurredAtUtc { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
