using Application.Common.Pagination;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Home
{
    public class PlaceSpecParams : BaseSpecParams
    {
        public string? Search { get; set; }
        public string? City { get; set; }
        public double? MinRating { get; set; }

        public string? Sort { get; set; }

    }
}
