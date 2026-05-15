using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class GuideToursHomeDto
    {
        public string GuideId { get; set; }
        public Guid Id { get; set; }

        public string Title { get; set; }

        public int DurationHours { get; set; }

        public int MaxGroupSize { get; set; }
        public decimal Price { get; set; }
        public string? PrimaryImage { get; set; }
    }
}
