using Application.DTOs.AuthenticationDTOs;

namespace Application.Services.Interfaces.Auth
{
    public interface IGoogleAuthService
    {
        Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string idToken);
    }
}
