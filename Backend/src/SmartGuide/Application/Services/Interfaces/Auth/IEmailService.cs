using System.Threading.Tasks;

namespace Application.Services.Interfaces.Auth
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}

