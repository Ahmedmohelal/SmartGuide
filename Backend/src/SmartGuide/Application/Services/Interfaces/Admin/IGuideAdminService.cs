using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IGuideAdminService
    {
        Task<Pagination<AdminGuideVerificationDto>> GetPendingGuidesAsync(AdminGuideSpecParams param);
        Task<Pagination<AdminGuideVerificationDto>> GetAllGuidesAsync(AdminGuideSpecParams param);
        Task<OperationResultDto> ApproveGuideAsync(string guideId);
        Task<OperationResultDto> RejectGuideAsync(string guideId, string reason);
        Task<OperationResultDto> ActivateGuideAsync(string guideId, string adminId, string reason, string? ipAddress);
        Task<OperationResultDto> SuspendGuideAsync(string guideId, string adminId, string reason, string? ipAddress);
        Task<OperationResultDto> BanGuideAsync(string guideId, string adminId, string reason, string? ipAddress);
        Task<OperationResultDto> PutUnderReviewAsync(string guideId, string adminId, string reason, string? ipAddress);
        Task<OperationResultDto> ForceLogoutGuideAsync(string guideId, string adminId, string reason, string? ipAddress);
        Task<GuideDocumentsDto?> GetGuideDocumentsAsync(string guideId);
    }
}
