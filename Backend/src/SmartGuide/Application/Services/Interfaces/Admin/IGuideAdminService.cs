using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IGuideAdminService
    {
        Task<List<AdminGuideVerificationDto>> GetPendingGuidesAsync();
        Task<List<AdminGuideVerificationDto>> GetAllGuidesAsync();
        Task<OperationResultDto> ApproveGuideAsync(string guideId);
        Task<OperationResultDto> RejectGuideAsync(string guideId, string reason);
    }
}
