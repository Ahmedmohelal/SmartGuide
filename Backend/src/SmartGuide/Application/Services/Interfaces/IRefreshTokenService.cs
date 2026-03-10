using Application.DTOs;

namespace Application.Services.Interfaces
{
    public interface IRefreshTokenService
    {
        Task<(string plainToken, DateTime expiresAt)> CreateAsync(string userId, CancellationToken cancellationToken = default);
        Task<RefreshTokenValidationResult> ValidateAndRotateAsync(string plainToken, CancellationToken cancellationToken = default);
         Task RevokeAllUserTokensAsync(string userId, CancellationToken cancellationToken);
        Task<string> GetUserIdFromRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);


        //Task<RefreshTokenValidationResult> RevokeAsync(string RefreshToken, CancellationToken cancellationToken = default);

    }
}
