using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class TourListItemDto
    {
        public Guid Id { get; set; }

        public string Title { get; set; } 

        public int DurationHours { get; set; }

        public decimal Price { get; set; }
        public string? PrimaryImage { get; set; }
    }
}
