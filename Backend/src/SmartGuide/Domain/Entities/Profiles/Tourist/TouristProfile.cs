namespace Domain.Entities.Profiles.Tourist
{
    public class TouristProfile
    {
        public Guid Id { get; set; }

        public string? TouristImage { get; set; }
        public string UserId { get; set; }
    }
}
