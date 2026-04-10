using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface IAuthService
    {
        public Task<AuthDto> RegisterAsync(RegisterDto model);
        public Task<AuthDto> GetTokenAsync(TokenRequestDto model);

        public Task<string> AddRoleAsync(AddRoleDto model);

        public Task<AuthRefreshResult> RefreshTokenAsync(string refreshToken);

        public Task<OperationResultDto> SendResetOtpAsync(SendResetOtpDto model);

        public Task<OperationResultDto> VerifyResetOtpAsync(VerifyResetOtpDto model);

        public Task<OperationResultDto> ForgotPasswordAsync(ForgotPasswordDto model);

        public Task<OperationResultDto> ResetPasswordAsync(ResetPasswordDto model);

        public Task<GoogleLoginResultDto> GoogleLoginAsync(string idToken);

        public Task<OperationResultDto> LogoutAsync(LogoutRequestDto model, CancellationToken cancellationToken = default);
    }
}
