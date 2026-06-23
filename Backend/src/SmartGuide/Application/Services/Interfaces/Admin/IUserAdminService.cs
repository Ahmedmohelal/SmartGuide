using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IUserAdminService
    {
        Task<Pagination<AdminUserDto>> GetAllUsersAsync(AdminUserSpecParams specParams);
        Task<AdminUserDto?> GetUserByIdAsync(string userId);
        Task<OperationResultDto> DeactivateUserAsync(string userId);
        Task<OperationResultDto> ActivateUserAsync(string userId);
        Task<OperationResultDto> DeleteUserAsync(string userId);

        Task<OperationResultDto> CreateAdminAsync(CreateAdminDto createAdminDto);
    }
}
