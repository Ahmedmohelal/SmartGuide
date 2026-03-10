using Application.DTOs;
using Application.Services.Interfaces;
using Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services.Identity
{
    public class UserServiceAdapter : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<UserServiceAdapter> _logger;

        public UserServiceAdapter(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<UserServiceAdapter> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        public async Task<string> AddToRoleAsync(User user, string role)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null)
                return "User not found.";

            var res = await _userManager.AddToRoleAsync(applicationUser, role);
            if (!res.Succeeded)
            {
                var errors = string.Join(", ", res.Errors.Select(e => e.Description));
                return errors;
            }

            return string.Empty;
        }

        public async Task<(User user, string errors)> CreateAsync(User user, string password)
        {
            var applicationUser = new ApplicationUser
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                UserName = user.UserName,
                Country = user.Country,
                Role = user.Role,
                GuideLicenseImage = user.GuideLicenseImage,
                NationalIdImage = user.NationalIdImage,
                WhatsAppNumber = user.WhatsAppNumber
            };

            var result = await _userManager.CreateAsync(applicationUser, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return (null, errors)!;
            }

            user = new User
            {
                Id = applicationUser.Id,
                FirstName = applicationUser.FirstName,
                LastName = applicationUser.LastName,
                Email = applicationUser.Email,
                UserName = applicationUser.UserName,
                Country = applicationUser.Country,
                Role = applicationUser.Role,
                GuideLicenseImage = applicationUser.GuideLicenseImage,
                NationalIdImage = applicationUser.NationalIdImage,
                WhatsAppNumber = applicationUser.WhatsAppNumber
            };
            return (user, null);
        }

        public async Task<(User? user, string? errors)> CreateExternalUserAsync(User user)
        {
            var applicationUser = new ApplicationUser
            {
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                Email = user.Email,
                Country = user.Country,
                UserName = user.UserName,
                EmailConfirmed = true,
                Role = user.Role,
                GuideLicenseImage = user.GuideLicenseImage,
                NationalIdImage = user.NationalIdImage,
                WhatsAppNumber = user.WhatsAppNumber
            };

            var password = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + "Aa1!";
            var result = await _userManager.CreateAsync(applicationUser, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogWarning("External user creation failed for {Email}: {Errors}", user.Email, errors);
                return (null, errors);
            }

            var createdUser = new User
            {
                Id = applicationUser.Id,
                FirstName = applicationUser.FirstName,
                Country = applicationUser.Country,
                LastName = applicationUser.LastName,
                Email = applicationUser.Email!,
                UserName = applicationUser.UserName!,
                Role = applicationUser.Role,
                GuideLicenseImage = applicationUser.GuideLicenseImage,
                NationalIdImage = applicationUser.NationalIdImage,
                WhatsAppNumber = applicationUser.WhatsAppNumber
            };
            return (createdUser, null);
        }

        public async Task<User?> FindByEmailAsync(string email)
        {
            var applicationUser = await _userManager.FindByEmailAsync(email);
            if (applicationUser == null) return null;

            return new User
            {
                Id = applicationUser.Id,
                FirstName = applicationUser.FirstName,
                LastName = applicationUser.LastName,
                Email = applicationUser.Email!,
                UserName = applicationUser.UserName!,
                Country = applicationUser.Country,
                Role = applicationUser.Role,
                GuideLicenseImage = applicationUser.GuideLicenseImage,
                NationalIdImage = applicationUser.NationalIdImage,
                WhatsAppNumber = applicationUser.WhatsAppNumber
            };
        }

        public async Task<User?> FindByIdAsync(string userId)
        {
            var applicationUser = await _userManager.FindByIdAsync(userId);
            if (applicationUser == null) return null;

            return new User
            {
                Id = applicationUser.Id,
                FirstName = applicationUser.FirstName,
                LastName = applicationUser.LastName,
                Email = applicationUser.Email!,
                Country = applicationUser.Country,
                UserName = applicationUser.UserName!,
                Role = applicationUser.Role,
                GuideLicenseImage = applicationUser.GuideLicenseImage,
                NationalIdImage = applicationUser.NationalIdImage,
                WhatsAppNumber = applicationUser.WhatsAppNumber
            };
        }

        public async Task<User?> FindByUserNameAsync(string userName)
        {
            var applicationUser = await _userManager.FindByNameAsync(userName);
            if (applicationUser == null) return null;

            return new User
            {
                Id = applicationUser.Id,
                FirstName = applicationUser.FirstName,
                LastName = applicationUser.LastName,
                Country = applicationUser.Country,
                Email = applicationUser.Email!,
                UserName = applicationUser.UserName!,
                Role = applicationUser.Role,
                GuideLicenseImage = applicationUser.GuideLicenseImage,
                NationalIdImage = applicationUser.NationalIdImage,
                WhatsAppNumber = applicationUser.WhatsAppNumber
            };
        }

        public async Task<bool> CheckPasswordAsync(User user, string password)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null) return false;
            return await _userManager.CheckPasswordAsync(applicationUser, password);
        }

        public async Task<List<string>> GetRolesAsync(User user)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null) return new List<string>();
            var roles = await _userManager.GetRolesAsync(applicationUser);
            return roles.ToList();
        }

        public async Task<bool> RoleExistsAsync(string role)
        {
            return await _roleManager.RoleExistsAsync(role);

        }

        public async Task<bool> IsInRoleAsync(User user, string role)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null) return false;
            return await _userManager.IsInRoleAsync(applicationUser, role);
        }

        public async Task<string?> GeneratePasswordResetTokenAsync(User user)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null) return null;

            return await _userManager.GeneratePasswordResetTokenAsync(applicationUser);
        }

        public async Task<string> ResetPasswordAsync(User user, string token, string newPassword)
        {
            var applicationUser = await _userManager.FindByNameAsync(user.UserName);
            if (applicationUser == null) return "User not found.";

            var result = await _userManager.ResetPasswordAsync(applicationUser, token, newPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return errors;
            }

            return string.Empty;
        }
    }
}
