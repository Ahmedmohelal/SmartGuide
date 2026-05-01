using Application.DTOs;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Auth;
using Google.Apis.Auth;
using Infrastructure.Settings;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text;

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

        //public async Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string idToken)
        //{
        //    if (string.IsNullOrWhiteSpace(idToken))
        //    {
        //        _logger.LogWarning("Google ID token validation failed: token is empty.");
        //        return GoogleTokenValidationResult.Failure("ID token is required.");
        //    }

        //    if (string.IsNullOrWhiteSpace(idToken))
        //        return GoogleTokenValidationResult.Failure("ID token is required.");

        //    idToken = idToken.Trim();

        //    if (idToken.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        //        idToken = idToken.Substring("Bearer ".Length).Trim();

        //    var validationSettings = new GoogleJsonWebSignature.ValidationSettings
        //    {
        //        Audience = _options.ClientIds,
        //    };

        //    GoogleJsonWebSignature.Payload payload;

        //    try
        //    {
        //        payload = await GoogleJsonWebSignature.ValidateAsync(idToken, validationSettings);

        //    }
        //    catch (InvalidJwtException ex)
        //    {
        //        _logger.LogWarning(ex, "Invalid or expired Google ID token.");
        //        //return GoogleTokenValidationResult.Failure("Invalid or expired ID token.");
        //        return GoogleTokenValidationResult.Failure(ex.Message);
        //    }
        //    catch (Exception ex)
        //    {
        //        //_logger.LogError(ex, "Unexpected error validating Google ID token.");
        //        ////return GoogleTokenValidationResult.Failure("Failed to validate token. Please try again.");
        //        //return GoogleTokenValidationResult.Failure(ex.Message);
        //        _logger.LogError(ex, "FormatException — Full message: {Msg} | Token length: {Len}",
        //    ex.Message, idToken.Length);
        //        return GoogleTokenValidationResult.Failure(ex.Message);
        //    }

        //    if (string.IsNullOrWhiteSpace(payload.Email))
        //    {
        //        _logger.LogWarning("Google ID token missing email claim.");
        //        return GoogleTokenValidationResult.Failure("Token does not contain a valid email.");
        //    }

        //    if (!payload.EmailVerified)
        //    {
        //        _logger.LogWarning("Google login rejected: email not verified for {Email}.", payload.Email);
        //        return GoogleTokenValidationResult.Failure("Email address is not verified with Google.");
        //    }

        //    var userInfo = new GoogleUserInfoDto(
        //        GoogleUserId: payload.Subject,
        //        Email: payload.Email,
        //        Name: payload.Name,
        //        EmailVerified: payload.EmailVerified,
        //        country: payload.Locale
        //        );

        //    return GoogleTokenValidationResult.Success(userInfo);
        //}
        public async Task<GoogleTokenValidationResult> VerifyIdTokenAsync(string IdToken)
        {
            if (string.IsNullOrWhiteSpace(IdToken))
                return GoogleTokenValidationResult.Failure("ID token is required.");

           
            _logger.LogInformation("Token length: {len}", IdToken.Length);
            _logger.LogInformation("Token start: {start}", IdToken.Substring(0, 30));
            _logger.LogInformation("Token end: {end}", IdToken.Substring(IdToken.Length - 30));
            _logger.LogInformation("Contains spaces: {hasSpace}", IdToken.Contains(" "));
            _logger.LogInformation("Contains newline: {hasNewLine}", IdToken.Contains("\n"));
            _logger.LogInformation("Contains quote: {hasQuote}", IdToken.Contains("\""));
            var validationSettings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = _options.ClientIds
            };

            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(IdToken, validationSettings);

                var userInfo = new GoogleUserInfoDto(
                    payload.Subject,
                    payload.Email,
                    payload.Name,
                    payload.EmailVerified,
                    payload.Locale
                );

                return GoogleTokenValidationResult.Success(userInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Google token validation failed");
                return GoogleTokenValidationResult.Failure(ex.Message);
            }
        }


    }
}
