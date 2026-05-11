using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Auth
{
    public interface IUserService
    {
        public Task<User?> FindByEmailAsync(string email);

        public Task<User?> FindByUserNameAsync(string userName);

        public Task<User?> FindByIdAsync(string userId);

        public Task<(User user, string errors)> CreateAsync(User user, string password);

        public Task<(User? user, string? errors)> CreateExternalUserAsync(User user);

        public Task<string> AddToRoleAsync(User user, string role);

        public Task<bool> CheckPasswordAsync(User user, string password);
        public Task<List<string>> GetRolesAsync(User user);

        public Task<bool> RoleExistsAsync(string role);

        public Task<bool> IsInRoleAsync(User user, string role);

        public Task<string?> GeneratePasswordResetTokenAsync(User user);

        public Task<string> ResetPasswordAsync(User user, string token, string newPassword);

        public Task<bool> SetResetPasswordOtpAsync(User user, string otp, DateTime expiresAtUtc);
        public Task<(string? otp, DateTime? expiresAtUtc)> GetResetPasswordOtpAsync(User user);
        public Task<bool> ClearResetPasswordOtpAsync(User user);
        public Task SetForceLogoutRequiredAsync(string userId, bool required);

    }
}
