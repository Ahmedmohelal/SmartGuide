using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.PlaceRatings
{
    public class PlaceReviewDto
    {
        public int Rating { get; set; }

        public string? Review { get; set; }

        public DateTime CreatedAtUtc { get; set; }
    }
}
