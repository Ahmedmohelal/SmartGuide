using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class GuideToursHomeDto
    {
        public string GuideId { get; set; }

        public string GuideName { get; set; }

        public string? GuideImage { get; set; }

        public List<TourListItemDto> Tours { get; set; } = new();
    }
}
