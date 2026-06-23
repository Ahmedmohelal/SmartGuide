using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.GuideDashboard
{
    public class UpdateTourRequestDTO
    {
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        public int? DurationHours { get; set; }
        
        public decimal? Price { get; set; }
        
        public int? MaxGroupSize { get; set; } 
        // JSON Strings
        public string? StopsJson { get; set; }
        public string? InclusionsJson { get; set; }
        public string? AddOnsJson { get; set; }

        // Files
        public List<IFormFile?>? Images { get; set; } = new();

    }


}
