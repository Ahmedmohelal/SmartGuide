using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Saved
{
    public class SavedTourGuideDto
    {
        public string GuideId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? ProfilePictureUrl { get; set; }
    }
}
