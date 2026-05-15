using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class GuideMyDocumentsDto
    {
        public string GuideId { get; set; } = default!;
        public string FullName { get; set; } = default!;
        public string? NationalIdImageUrl { get; set; }

        public string? LicenseImageUrl { get; set; }

        public string VerificationStatus { get; set; } = default!;

    }
}
