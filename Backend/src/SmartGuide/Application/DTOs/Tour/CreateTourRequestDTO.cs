using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
namespace Application.DTOs.Tour
{
    public class CreateTourRequestDTO
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        [Required]
        public int DurationHours { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int MaxGroupSize { get; set; }

        //public List<CreateTourStopDto> Stops { get; set; } = new();
        //public List<CreateTourInclusionDto> Inclusions { get; set; } = new();
        //public List<CreateTourImageDto> Images { get; set; } = new();
        //public List<CreateTourAddOnDto> AddOns { get; set; } = new();

        // JSON Strings
        public string StopsJson { get; set; }
        public string InclusionsJson { get; set; }
        public string AddOnsJson { get; set; }

        // Files
        public List<IFormFile> Images { get; set; } = new();

    }
}
