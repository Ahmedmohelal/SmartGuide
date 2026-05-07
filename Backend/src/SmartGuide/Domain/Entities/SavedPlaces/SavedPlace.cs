using Domain.Entities.Home;
using Domain.Entities.Profiles.Tourist;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.SavedPlaces
{
    public class SavedPlace
    {
        public int Id { get; set; }

        public string TouristUserId { get; set; }

        public int PlaceId { get; set; }

        public DateTime CreatedAtUtc { get; set; }

        // Navigation Properties
        public TouristProfile? Tourist { get; set; }

        public Place? Place { get; set; }
    }
}
