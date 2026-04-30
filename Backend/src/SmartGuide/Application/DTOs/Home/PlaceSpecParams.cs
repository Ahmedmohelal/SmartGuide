using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Home
{
    public class PlaceSpecParams
    {
        public string? Search { get; set; }
        public string? City { get; set; }
        public double? MinRating { get; set; }

        public string? Sort { get; set; }

        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
