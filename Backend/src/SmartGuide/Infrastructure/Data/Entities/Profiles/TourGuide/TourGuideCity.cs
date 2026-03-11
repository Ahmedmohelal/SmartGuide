using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Entities.Profiles.TourGuide
{
    public class TourGuideCity
    {
        public int Id { get; set; }

        public string CityName { get; set; }

        public string TourGuideProfileId { get; set; }

        public TourGuideProfile TourGuideProfile { get; set; }
    }
}
