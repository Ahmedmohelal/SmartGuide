using Application.DTOs;
using Application.Helper;
using Application.Services.Interfaces;
using Microsoft.Extensions.Logging;
using System.Security.Cryptography;
using System.Text;
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
                NationalIdImage = nationalIdImage,
                WhatsAppNumber = model.WhatsAppNumber
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
                WhatsAppNumber = appUser.WhatsAppNumber,
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
                Id= user.Id,
                Email = user.Email,
                UserName = user.UserName,
                Country = user.Country,
                WhatsAppNumber = user.WhatsAppNumber,
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
                WhatsAppNumber = result.User.WhatsAppNumber,
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

            if (user is null || !await _userService.RoleExistsAsync(model.Role))
                return "User or Role  Not Found";

            if (await _userService.IsInRoleAsync(user, model.Role))
                return "User already assigned to this role";

            var res = await _userService.AddToRoleAsync(user, model.Role);

            if (!string.IsNullOrEmpty(res))
                return res;

            return "Role Added to User Successfully";

        }

        public async Task<OperationResultDto> SendResetOtpAsync(SendResetOtpDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user is null)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "User not found."
                };
            }

            try
            {
                var otp = GenerateSixDigitOtp();
                var expiresAtUtc = DateTime.UtcNow.AddMinutes(10);

                var saved = await _userService.SetResetPasswordOtpAsync(user, otp, expiresAtUtc);
                if (!saved)
                {
                    _logger.LogWarning("Failed to persist reset password OTP for {Email}.", user.Email);
                    return new OperationResultDto
                    {
                        IsSuccess = false,
                        Message = "Unable to process request. Please try again."
                    };
                }

                var subject = "SmartGuide password reset OTP";
                var body =
                    $"""
                    <p>Hello,</p>
                    <p>Your password reset OTP is:</p>
                    <h2>{otp}</h2>
                    <p>This OTP expires in 10 minutes.</p>
                    <p>If you did not request this, you can safely ignore this email.</p>
                    """;

                await _emailService.SendEmailAsync(user.Email, subject, body);

                return new OperationResultDto
                {
                    IsSuccess = true,
                    Message = "OTP has been sent to your email."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending reset OTP for {Email}.", model.Email);
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Unable to process request. Please try again."
                };
            }
        }

        public async Task<OperationResultDto> VerifyResetOtpAsync(VerifyResetOtpDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user is null)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "User not found."
                };
            }

            var isValid = await IsResetOtpValidAsync(user, model.Otp);
            return new OperationResultDto
            {
                IsSuccess = isValid,
                Message = isValid ? "OTP is valid." : "Invalid or expired OTP."
            };
        }

        public async Task<OperationResultDto> ForgotPasswordAsync(ForgotPasswordDto model)
        {
           
            var user = await _userService.FindByEmailAsync(model.Email);
            if (user is not null)
            {
                _ = await SendResetOtpAsync(new SendResetOtpDto { Email = model.Email });
            }

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "If an account with this email exists, an OTP has been sent."
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
                    Message = "User not found."
                };
            }

            if (!await IsResetOtpValidAsync(user, model.Otp))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Invalid or expired OTP."
                };
            }

            var token = await _userService.GeneratePasswordResetTokenAsync(user);
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Failed to generate password reset token for {Email}.", user.Email);
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Unable to reset password. Please try again."
                };
            }

            var resetResult = await _userService.ResetPasswordAsync(user, token, model.NewPassword);
            if (!string.IsNullOrEmpty(resetResult))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = resetResult
                };
            }

            _ = await _userService.ClearResetPasswordOtpAsync(user);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Password has been reset successfully."
            };
        }

        private static string GenerateSixDigitOtp()
        {
            var value = RandomNumberGenerator.GetInt32(0, 1_000_000);
            return value.ToString("D6");
        }

        private async Task<bool> IsResetOtpValidAsync(User user, string otp)
        {
            var (storedOtp, expiresAtUtc) = await _userService.GetResetPasswordOtpAsync(user);
            if (string.IsNullOrWhiteSpace(storedOtp) || expiresAtUtc is null)
                return false;

            if (DateTime.UtcNow > expiresAtUtc.Value)
                return false;

            if (storedOtp.Length != otp.Length)
                return false;

            var storedBytes = Encoding.UTF8.GetBytes(storedOtp);
            var providedBytes = Encoding.UTF8.GetBytes(otp);
            return CryptographicOperations.FixedTimeEquals(storedBytes, providedBytes);
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
