using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Application.Services.Interfaces.Auth;
using Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(
            IOptions<EmailSettings> options,
            ILogger<EmailService> logger)
        {
            _settings = options.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            using var message = new MailMessage
            {
                From = new MailAddress(_settings.SenderEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(new MailAddress(to));

            using var client = new SmtpClient(_settings.SmtpServer, _settings.Port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_settings.SenderEmail, _settings.Password)
            };

            try
            {
                await client.SendMailAsync(message);
            }
            catch (SmtpException ex)
            {
                _logger.LogError(ex, "Failed to send email to {Recipient}.", to);
                throw;
            }
        }
    }
}

