using Application.DTOs;
using Application.Services.Interfaces;
using Google.Apis.Auth;
using Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services.Auth
{
    public class GoogleAuthService : IGoogleAuthService
    {
        private readonly GoogleAuthOptions _options;
        private readonly ILogger<GoogleAuthService> _logger;

        public GoogleAuthService(
            IOptions<GoogleAuthOptions> options,
            ILogger<GoogleAuthService> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string idToken)
        {
            if (string.IsNullOrWhiteSpace(idToken))
            {
                _logger.LogWarning("Google ID token validation failed: token is empty.");
                return GoogleTokenValidationResult.Failure("ID token is required.");
            }

            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { _options.ClientId }
            };

            GoogleJsonWebSignature.Payload payload;

            try
            {
                payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning(ex, "Invalid or expired Google ID token.");
                return GoogleTokenValidationResult.Failure("Invalid or expired ID token.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error validating Google ID token.");
                return GoogleTokenValidationResult.Failure("Failed to validate token. Please try again.");
            }

            if (string.IsNullOrWhiteSpace(payload.Email))
            {
                _logger.LogWarning("Google ID token missing email claim.");
                return GoogleTokenValidationResult.Failure("Token does not contain a valid email.");
            }

            if (!payload.EmailVerified)
            {
                _logger.LogWarning("Google login rejected: email not verified for {Email}.", payload.Email);
                return GoogleTokenValidationResult.Failure("Email address is not verified with Google.");
            }

            var userInfo = new GoogleUserInfoDto(
                GoogleUserId: payload.Subject,
                Email: payload.Email,
                Name: payload.Name,
                EmailVerified: payload.EmailVerified);

            return GoogleTokenValidationResult.Success(userInfo);
        }
    }
}
