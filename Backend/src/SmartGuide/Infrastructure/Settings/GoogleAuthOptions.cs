namespace Infrastructure.Settings
{
    public class GoogleAuthOptions
    {
        public const string SectionName = "Authentication:Google";

        public List<string> ClientIds { get; set; } = new();
    }
}
