using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class GuideDocumentsDto
    {
        public string GuideId { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string Email { get; set; } = default!;

        public string? NationalIdImageUrl { get; set; }
        public string? LicenseImageUrl { get; set; }

        public string Status { get; set; } = default!;
    }
}
