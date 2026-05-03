using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Favorites
{
    public class SavedTourGuide
    {
        public string TouristUserId { get; set; } = string.Empty;
        public string TourGuideUserId { get; set; } = string.Empty;

        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
