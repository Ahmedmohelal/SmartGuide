using Application.DTOs;
using Application.Services.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.Entities;
using Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;

namespace Infrastructure.Services.Token
{
    public sealed class RefreshTokenService : IRefreshTokenService
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly IUserService _userService;
        private readonly JWT _jwtOptions;
        private const int TokenByteLength = 64;

        public RefreshTokenService(
            ApplicationDbContext dbContext,
            IUserService userService,
            IOptions<JWT> jwtOptions)
        {
            _dbContext = dbContext;
            _userService = userService;
            _jwtOptions = jwtOptions.Value;
        }

        public async Task<(string plainToken, DateTime expiresAt)> CreateAsync(string userId, CancellationToken cancellationToken = default)
        {
            var plainToken = GenerateSecureToken();
            var tokenHash = HashToken(plainToken);
            var expiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays > 0
                ? _jwtOptions.RefreshTokenExpirationDays
                : 7);

            var entity = new RefreshToken
            {
                TokenHash = tokenHash,
                UserId = userId,
                ExpirationDate = expiresAt,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.RefreshTokens.Add(entity);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return (plainToken, expiresAt);
        }

        public async Task<RefreshTokenValidationResult> ValidateAndRotateAsync(string plainToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(plainToken))
                return RefreshTokenValidationResult.Failure("InvalidToken", "Refresh token is required.");

            var tokenHash = HashToken(plainToken);
            var storedToken = await _dbContext.RefreshTokens
                .Include(rt => rt.User)
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash, cancellationToken);

            if (storedToken == null)
                return RefreshTokenValidationResult.Failure("NotFound", "Refresh token not found.");

            if (storedToken.IsRevoked)
            {
                await RevokeAllUserTokensAsync(storedToken.UserId, cancellationToken);
                return RefreshTokenValidationResult.Failure("ReuseDetected", "Refresh token reuse detected. All tokens for this user have been revoked.");
            }

            if (storedToken.ExpirationDate < DateTime.UtcNow)
                return RefreshTokenValidationResult.Failure("Expired", "Refresh token has expired.");

            var user = await _userService.FindByIdAsync(storedToken.UserId);
            if (user == null)
                return RefreshTokenValidationResult.Failure("UserNotFound", "User no longer exists.");

            storedToken.RevokedAt = DateTime.UtcNow;
            var (newPlainToken, newExpiresAt) = await CreateAsync(storedToken.UserId, cancellationToken);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return RefreshTokenValidationResult.Success(user, newPlainToken, newExpiresAt);
        }

        public async Task RevokeAllUserTokensAsync(string userId, CancellationToken cancellationToken)
        {
            await _dbContext.RefreshTokens
                .Where(rt => rt.UserId == userId && !rt.RevokedAt.HasValue)
                .ExecuteUpdateAsync(s => s.SetProperty(rt => rt.RevokedAt, DateTime.UtcNow), cancellationToken);
        }

        private static string GenerateSecureToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(TokenByteLength);
            return Convert.ToBase64String(bytes);
        }

        private static string HashToken(string plainToken)
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(plainToken);
            var hash = SHA256.HashData(bytes);
            return Convert.ToHexString(hash);
        }

        public async Task<string?> GetUserIdFromRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return null;

            var tokenHash = HashToken(refreshToken);

            return await _dbContext.RefreshTokens
                .Where(rt => rt.TokenHash == tokenHash && !rt.RevokedAt.HasValue && rt.ExpirationDate > DateTime.UtcNow)
                .Select(rt => rt.UserId)
                .FirstOrDefaultAsync(cancellationToken);
        }
    }
}
