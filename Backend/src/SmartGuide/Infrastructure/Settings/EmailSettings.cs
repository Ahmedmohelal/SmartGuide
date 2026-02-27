namespace Infrastructure.Settings
{
    public sealed class EmailSettings
    {
        public const string SectionName = "EmailSettings";

        public string SenderEmail { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string SmtpServer { get; set; } = string.Empty;

        public int Port { get; set; }
    }
}

