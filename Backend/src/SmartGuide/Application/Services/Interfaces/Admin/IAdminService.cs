using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IAdminService
    {
        // Users
        Task<List<AdminUserDto>> GetAllUsersAsync();
        Task<AdminUserDto?> GetUserByIdAsync(string userId);
        Task<OperationResultDto> DeactivateUserAsync(string userId);
        Task<OperationResultDto> ActivateUserAsync(string userId);
        Task<OperationResultDto> DeleteUserAsync(string userId);

        // Guide Verification
        Task<List<AdminGuideVerificationDto>> GetPendingGuidesAsync();
        Task<List<AdminGuideVerificationDto>> GetAllGuidesAsync();
        Task<OperationResultDto> ApproveGuideAsync(string guideId);
        Task<OperationResultDto> RejectGuideAsync(string guideId, string reason);

        // Tours
        Task<List<AdminTourDto>> GetAllToursAsync();
        Task<OperationResultDto> DeactivateTourAsync(Guid tourId);
        Task<OperationResultDto> ActivateTourAsync(Guid tourId);
        Task<OperationResultDto> DeleteTourAsync(Guid tourId);

        // Bookings
        Task<List<AdminBookingDto>> GetAllBookingsAsync(string? status = null, string? guideId = null);

        // Statistics
        Task<AdminStatisticsDto> GetStatisticsAsync();

        // Revenue
        Task<AdminRevenueDto> GetRevenueAsync();
    }
}
