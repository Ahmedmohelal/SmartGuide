using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class TourCardDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; }

        public decimal Price { get; set; }

        public int DurationHours { get; set; }

        public string ImageUrl { get; set; } = string.Empty;
    }
}

