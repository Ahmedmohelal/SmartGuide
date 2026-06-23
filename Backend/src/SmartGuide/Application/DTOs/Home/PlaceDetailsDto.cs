using Application.DTOs.PlaceRatings;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Home
{
    public class PlaceDetailsDto
    {
        public int Id { get; set; }

        public string? Name { get; set; }
        public string? Type { get; set; }    

        public string? Description { get; set; }

        public string? Location { get; set; }
        public string? City { get; set; }

        public string? Governorate { get; set; }

        public string? ImageUrl { get; set; }

        //public double? Rating { get; set; }

        public string? HistoricalBackground { get; set; }

        public string? CreatedBy { get; set; }

        public string? Period { get; set; }

        public int? StartYear { get; set; }

        public double AverageRating { get; set; }

        public int RatingsCount { get; set; }

        public int? MyRating { get; set; }

        public List<PlaceReviewDto> Reviews { get; set; } = new();

    }
}
