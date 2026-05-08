using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IUserAdminService
    {
        Task<List<AdminUserDto>> GetAllUsersAsync();
        Task<AdminUserDto?> GetUserByIdAsync(string userId);
        Task<OperationResultDto> DeactivateUserAsync(string userId);
        Task<OperationResultDto> ActivateUserAsync(string userId);
        Task<OperationResultDto> DeleteUserAsync(string userId);

        Task<OperationResultDto> CreateAdminAsync(CreateAdminDto createAdminDto);
    }
}
