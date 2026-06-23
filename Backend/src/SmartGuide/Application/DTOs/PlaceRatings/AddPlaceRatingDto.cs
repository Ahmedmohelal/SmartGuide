using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.PlaceRatings
{
    public class AddPlaceRatingDto
    {
        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Review { get; set; }
    }
}
