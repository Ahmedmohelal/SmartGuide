using Application.DTOs;

namespace Application.Services.Interfaces
{
    public interface IGoogleAuthService
    {
        Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string idToken);
    }
}
