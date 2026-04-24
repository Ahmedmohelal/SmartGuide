namespace Domain.Entities.Profiles.TourGuide
{
    public class TourGuideLanguage
    {
        public int Id { get; set; }

        public string Language { get; set; }

        public string TourGuideProfileId { get; set; }

        public TourGuideProfile TourGuideProfile { get; set; }
    }
}
