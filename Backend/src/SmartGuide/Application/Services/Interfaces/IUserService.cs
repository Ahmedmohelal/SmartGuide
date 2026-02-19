using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface IUserService
    {
        public Task<User> FindByEmailAsync(string email);

        public Task<User> FindByUserNameAsync(string userName);

        public Task<(User user, string errors)> CreateAsync(User user, string password);

        public Task<string>  AddToRoleAsync(User user, string role);

        public Task<bool> CheckPasswordAsync(User user, string password);

        public Task<List<string>> GetRolesAsync(User user);

        public Task<bool> RoleExistsAsync(string role);

        public Task<bool> IsInRoleAsync(User user, string role);
    }
}
