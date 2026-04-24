using Application.DTOs.AuthenticationDTOs;

namespace Application.Services.Interfaces
{
    public interface IGoogleAuthService
    {
        Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string idToken);
    }
}
