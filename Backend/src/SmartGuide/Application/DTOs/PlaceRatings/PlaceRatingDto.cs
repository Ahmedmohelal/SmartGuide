using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.PlaceRatings
{
    public class PlaceRatingDto
    {
        public string UserId { get; set; } = null!;

        public int Rating { get; set; }

        public string? Review { get; set; }

        public DateTime CreatedAtUtc { get; set; }
    }
}
