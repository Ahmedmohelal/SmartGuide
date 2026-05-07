using Domain.Entities.SavedPlaces;

namespace Domain.Entities.Profiles.Tourist
{
    public class TouristProfile
    {
        public Guid Id { get; set; }

        public string? TouristImage { get; set; }
        public string UserId { get; set; }
        public ICollection<SavedPlace> SavedPlaces { get; set; }
    = new List<SavedPlace>();
    }
}
