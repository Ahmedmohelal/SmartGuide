using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IGuideWalletAdminService
    {
        Task<GuideWalletDto> GetWalletAsync(string guideId);
        Task<List<GuideWalletTransactionDto>> GetTransactionsAsync(string guideId, int take = 100);
        Task<OperationResultDto> AddBalanceAsync(string guideId, string adminId, GuideWalletAdjustmentDto dto, string? ipAddress);
        Task<OperationResultDto> DeductBalanceAsync(string guideId, string adminId, GuideWalletAdjustmentDto dto, string? ipAddress);
        Task<OperationResultDto> SetFreezeStateAsync(string guideId, bool freeze, string adminId, string reason, string? ipAddress);
    }
}
