using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Pagination
{
    public class AdminBookingSpecParams
    : BaseSpecParams
    {
        public string? Status { get; set; }

        public string? GuideId { get; set; }

        public string? TouristId { get; set; }

        public DateTime? FromDate { get; set; }

        public DateTime? ToDate { get; set; }
    }
}
