using Domain.Entities.Tours;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Tours
{
    public class Tour
    {
        public Guid Id { get;  set; }
        public string GuideId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationHours { get; set; }
        public decimal Price { get; set; }
        public  int  MaxGroupSize { get; set; }
        public  bool IsActive { get; set; }

        public List<TourStops> TourStops { get; set; } = new();
        public List<TourInclusion> TourInclusions { get; set; } = new();
        public List<TourImage> TourImages { get; set; } = new();
        public List<TourAddOn> TourAddOns { get; set; } = new();

    }
}
