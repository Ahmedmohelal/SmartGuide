using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Home
{
    public class PlaceCardDto
    {
        public int Id { get; set; }
        public string?   Name { get; set; }
        public string? ImageUrl { get; set; }
        public double? Rating { get; set; }
    }
}
