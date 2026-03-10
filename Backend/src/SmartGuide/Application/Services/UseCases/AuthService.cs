using Application.DTOs;
using Application.Helper;
using Application.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.ComponentModel;
using System.Net;

namespace Application.Services.UseCases
{
    public class AuthService : IAuthService
    {
        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly IGoogleAuthService _googleAuthService;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthService> _logger;
        private readonly IAttachmentService _attachmentService;

        public AuthService(
            ITokenService tokenService,
            IUserService userService,
            IRefreshTokenService refreshTokenService,
            IGoogleAuthService googleAuthService,
            IEmailService emailService,
            ILogger<AuthService> logger,
            IAttachmentService attachmentService)
        {
            _tokenService = tokenService;
            _userService = userService;
            _refreshTokenService = refreshTokenService;
            _googleAuthService = googleAuthService;
            _emailService = emailService;
            _logger = logger;
            _attachmentService = attachmentService;
        }

        public async Task<AuthDto> RegisterAsync(RegisterDto model)
        {
            if (await _userService.FindByEmailAsync(model.Email) is not null)
                return new AuthDto { Message = ErrorMessages.EmailAlreadyExists };

            if (await _userService.FindByUserNameAsync(model.UserName) is not null)
                return new AuthDto { Message = ErrorMessages.UserNameAlreadyExists };
          

            string? licenseImage = null;
            string? nationalIdImage = null;
            if (model.Role.Trim().Equals(Roles.TourGuide.ToString(), StringComparison.OrdinalIgnoreCase))
            {
                try
                {

                    if (model.GuideLicenseImage == null || model.NationalIdImage == null)
                        return new AuthDto { Message = "Guide images required" };

                    licenseImage = await _attachmentService.Upload("licenses", model.GuideLicenseImage);

                    nationalIdImage = await _attachmentService.Upload("nationalIds", model.NationalIdImage);

                }
                catch
                {

                    await DeleteGuideImages(licenseImage, nationalIdImage);
                    return new AuthDto { Message = ErrorMessages.UploadFailed };

                }

            }
            var newUser = new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                UserName = model.UserName,
                Email = model.Email,
                Country = model.Country,
                Role = model.Role.Trim(),
                GuideLicenseImage = licenseImage,
                NationalIdImage = nationalIdImage
            };

            var (appUser, errors) = await _userService.CreateAsync(newUser, model.Password);


            if (!string.IsNullOrEmpty(errors))
            {
                await DeleteGuideImages(licenseImage, nationalIdImage);
                return new AuthDto { Message = errors };
            }
            var roleErrors = await _userService.AddToRoleAsync(appUser, model.Role);

            if (!string.IsNullOrEmpty(roleErrors))
            {
                await DeleteGuideImages(licenseImage, nationalIdImage);
                return new AuthDto { Message = roleErrors };
            }

            var (token, expires) = await _tokenService.CreateTokenAsync(appUser);
            var (refreshToken, refreshExpires) = await _refreshTokenService.CreateAsync(appUser.Id);

            return new AuthDto
            {

                Message = "User Registered Successfully",
                IsAuthanticated = true,
                Id = appUser.Id,
                UserName = appUser.UserName,
                Email = appUser.Email,
                Country = appUser.Country,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = refreshExpires,
                Roles = await _userService.GetRolesAsync(appUser),
                IsGuideVerified = false
            };

        }

        private async Task DeleteGuideImages(string? licenseImage, string? nationalIdImage)
        {
            if (licenseImage != null)
                await _attachmentService.Delete(licenseImage, "licenses");

            if (nationalIdImage != null)
                await _attachmentService.Delete(nationalIdImage, "nationalIds");
        }
        public async Task<AuthDto> GetTokenAsync(TokenRequestDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);

            if (user is null || !await _userService.CheckPasswordAsync(user, model.Password))
                return new AuthDto { Message = "Email or Password Is incorrect" };

            var (token, expires) = await _tokenService.CreateTokenAsync(user);
            var (refreshToken, refreshExpires) = await _refreshTokenService.CreateAsync(user.Id);
            var roles = await _userService.GetRolesAsync(user);

            return new AuthDto
            {
                Message = "Login successful",
                IsAuthanticated = true,
                Email = user.Email,
                UserName = user.UserName,
                Country = user.Country,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = refreshExpires,
                Roles = roles
            };
        }

        public async Task<AuthRefreshResult> RefreshTokenAsync(string refreshToken)
        {
            var result = await _refreshTokenService.ValidateAndRotateAsync(refreshToken);

            if (!result.IsValid || result.User == null)
                return AuthRefreshResult.Failure(result.ErrorCode, result.ErrorMessage);

            var (token, expires) = await _tokenService.CreateTokenAsync(result.User);
            var roles = await _userService.GetRolesAsync(result.User);

            var auth = new AuthDto
            {
                Message = "Token refreshed successfully",
                IsAuthanticated = true,
                Email = result.User.Email,
                UserName = result.User.UserName,
                Country = result.User.Country,
                Token = token,
                RefreshToken = result.NewPlainToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = result.NewTokenExpiresAt,
                Roles = roles
            };

            return AuthRefreshResult.Success(auth);
        }


        public async Task<string> AddRoleAsync(AddRoleDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);

            if (user is null || !_userService.RoleExistsAsync(model.Role).Result)
                return "User or Role  Not Found";

            if (await _userService.IsInRoleAsync(user, model.Role))
                return "User already assigned to this role";

            var res = await _userService.AddToRoleAsync(user, model.Role);

            if (!string.IsNullOrEmpty(res))
                return res;

            return "Role Added to User Successfully";

        }

        public async Task<OperationResultDto> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user is not null)
            {
                try
                {
                    var token = await _userService.GeneratePasswordResetTokenAsync(user);
                    if (!string.IsNullOrEmpty(token))
                    {
                        var encodedEmail = WebUtility.UrlEncode(user.Email);
                        var encodedToken = WebUtility.UrlEncode(token);
                        var resetLink =
                            $"https://localhost:5001/api/auth/reset-password?email={encodedEmail}&token={encodedToken}";

                        var subject = "Reset your SmartGuide password";
                        var body =
                            $"""
                            <p>Hello,</p>
                            <p>You requested to reset your password. Click the link below to set a new password:</p>
                            <p><a href="{resetLink}">Reset your password</a></p>
                            <p>If you did not request this, you can safely ignore this email.</p>
                            """;

                        await _emailService.SendEmailAsync(user.Email, subject, body);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to generate password reset token for user {Email}.", user.Email);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error while processing forgot password for {Email}.", model.Email);
                }
            }

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "If an account with this email exists, a reset link has been sent."
            };
        }

        public async Task<OperationResultDto> ResetPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user is null)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Invalid password reset request."
                };
            }
            var decodedToken = Uri.UnescapeDataString(model.Token);

            var resetResult = await _userService.ResetPasswordAsync(user, decodedToken, model.NewPassword);
            if (!string.IsNullOrEmpty(resetResult))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = resetResult
                };
            }

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Password has been reset successfully."
            };
        }

        public async Task<GoogleLoginResultDto> GoogleLoginAsync(string idToken)
        {
            var validationResult = await _googleAuthService.VerifyIdTokenAsync(idToken);
            if (!validationResult.IsSuccess)
            {
                _logger.LogWarning("Google login failed: {Message}", validationResult.ErrorMessage);
                return GoogleLoginResultDto.Failure(validationResult.ErrorMessage ?? "Invalid Google token.");
            }

            var userInfo = validationResult.UserInfo!;
            var user = await _userService.FindByEmailAsync(userInfo.Email);

            if (user is null)
            {
                var nameParts = (userInfo.Name ?? userInfo.Email).Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
                var newUser = new User
                {
                    FirstName = nameParts.Length > 0 ? nameParts[0] : string.Empty,
                    LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
                    Email = userInfo.Email,
                    UserName = userInfo.Email
                };

                var (createdUser, createErrors) = await _userService.CreateExternalUserAsync(newUser);
                if (createdUser is null)
                {
                    _logger.LogError("Failed to create user for Google login: {Errors}", createErrors);
                    return GoogleLoginResultDto.Failure("Unable to complete sign-in. Please try again.");
                }

                var roleErrors = await _userService.AddToRoleAsync(createdUser, Roles.Tourist);
                if (!string.IsNullOrEmpty(roleErrors))
                {
                    _logger.LogWarning("Failed to assign role to new Google user {Email}: {Errors}", createdUser.Email, roleErrors);
                }

                user = createdUser;
            }

            var (token, expires) = await _tokenService.CreateTokenAsync(user);
            var (refreshToken, refreshExpires) = await _refreshTokenService.CreateAsync(user.Id);

            var auth = new AuthResponseDto(
                AccessToken: token,
                RefreshToken: refreshToken,
                ExpiresOn: expires,
                RefreshTokenExpiresOn: refreshExpires);

            return GoogleLoginResultDto.Success(auth);
        }
    }
}
