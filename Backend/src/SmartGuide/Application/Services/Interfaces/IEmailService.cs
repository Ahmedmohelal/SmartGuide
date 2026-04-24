using System.Threading.Tasks;

namespace Application.Services.Interfaces
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string body);
    }
}

