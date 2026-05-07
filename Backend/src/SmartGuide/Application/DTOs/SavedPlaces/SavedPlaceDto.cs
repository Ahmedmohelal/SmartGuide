using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.SavedPlaces
{
    public class SavedPlaceDto
    {
        public int PlaceId { get; set; }

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public string? City { get; set; }

        public double? Rating { get; set; }
    }
}
