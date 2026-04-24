using System.Collections.Generic;

namespace Domain.Entities.Profiles.TourGuide
{
    public class TourGuideProfile
    {
        public string UserId { get; set; }

        public string? Bio { get; set; }

        public decimal? PricePerDay { get; set; }
        public decimal Rating { get; set; }

        public string? ProfilePicture { get; set; }

        public ICollection<TourGuideCity>? Cities { get; set; } = new List<TourGuideCity>();

        public ICollection<TourGuideLanguage>? Languages { get; set; } = new List<TourGuideLanguage>();

        public ICollection<TourGuideGallery>? Gallery { get; set; } = new List<TourGuideGallery>();
    }
}
