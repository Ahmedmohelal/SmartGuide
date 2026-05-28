using Domain.Entities.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.PlaceRatings
{
    public class PlaceRating
    {
        public Guid Id { get; set; }

        public string UserId { get; set; } = null!;

        public int PlaceId { get; set; }

        public int Rating { get; set; }

        public string? Review { get; set; }

        public DateTime CreatedAtUtc { get; set; } =
            DateTime.UtcNow;

        public DateTime? UpdatedAtUtc { get; set; }

        // Navigation Properties
        public Place? Place { get; set; }
    }
}
