using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Tours
{
    public class TourImage
    {
        public Guid Id { get; set; }
        public Guid TourId { get; set; }
        public Tour Tour { get; set; }
        public string ImageUrl { get; set; }
        public bool IsPrimary { get; set; }
        public int OrderIndex { get; set; }
    }
}
