namespace Domain.Entities.Profiles.TourGuide
{
    public class TourGuideGallery
    {
        public int Id { get; set; }

        public string ImageUrl { get; set; }

        public string TourGuideProfileId { get; set; }

        public TourGuideProfile TourGuideProfile { get; set; }
    }
}
