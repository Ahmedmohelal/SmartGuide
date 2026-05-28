using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Common.Pagination
{
    public class AdminTourSpecParams
    : BaseSpecParams
    {
        public string? Search { get; set; }

        public string? GuideId { get; set; }

        public bool? IsActive { get; set; }

        public decimal? MinPrice { get; set; }

        public decimal? MaxPrice { get; set; }
    }
}
