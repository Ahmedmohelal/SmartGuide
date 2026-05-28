using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Pagination
{
    public class AdminGuideSpecParams
    : BaseSpecParams
    {
        public string? Search { get; set; }

        public string? VerificationStatus { get; set; }

        public string? Country { get; set; }
    }
}
