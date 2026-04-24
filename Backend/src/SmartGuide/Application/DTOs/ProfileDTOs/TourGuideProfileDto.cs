namespace Application.DTOs.ProfileDTOs
{
    public class TourGuideProfileDto
    {
        public string UserId { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string? WhatsAppNumber { get; set; }
        public string? Bio { get; set; } = string.Empty;
        public decimal? PricePerDay { get; set; }
        public decimal? Rating { get; set; }
        public string? ProfilePicture { get; set; } = string.Empty;
        public List<string>? Cities { get; set; } = new();
        public List<string>? Languages { get; set; } = new();
        public List<string>? Gallery { get; set; } = new();
    }
}
