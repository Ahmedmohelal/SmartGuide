using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class TourDetailsDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationHours { get; set; }
        public decimal Price { get; set; }

        public List<string> Images { get; set; }

        public List<CreateTourStopDto> Stops { get; set; }
        public List<CreateTourInclusionDto> Inclusions { get; set; }
        public List<CreateTourAddOnDto> AddOns { get; set; }
    }
}
