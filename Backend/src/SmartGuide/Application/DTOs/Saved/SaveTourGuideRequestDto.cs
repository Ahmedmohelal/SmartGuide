using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.Saved
{
    public class SaveTourGuideRequestDto
    {
        [Required]
        public string GuideId { get; set; } = string.Empty;
    }
}
