using Domain.Entities.PlaceRatings;
using Domain.Entities.SavedPlaces;
using Domain.Entities.Tours;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Home
{
    public class Place
    {
        public int Id { get; set; }

        public string? Name { get; set; }

        public string? Type { get; set; }

        public string? Description { get; set; }

        public string? Location { get; set; }

        public string? City { get; set; }

        public string? Governorate { get; set; }
        public string? ImageUrl { get; set; }

        public string? HistoricalBackground { get; set; }

        public string? CreatedBy { get; set; }

        public double? Rating { get; set; }
        public string? Period { get; set; }

        public int? StartYear { get; set; }

        public List<PlaceRating> Ratings { get; set; } = new();
        public ICollection<TourStops> TourStops { get; set; }
           = new List<TourStops>();
        public ICollection<SavedPlace> SavedByTourists { get; set; }
           = new List<SavedPlace>();
    }
}
