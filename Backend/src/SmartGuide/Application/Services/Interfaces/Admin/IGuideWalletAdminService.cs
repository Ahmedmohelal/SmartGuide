using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IGuideWalletAdminService
    {
        Task<GuideWalletDto> GetWalletAsync(string guideId);
        Task<Pagination<GuideWalletTransactionDto>> GetTransactionsAsync(string guideId, WalletTransactionSpecParams param);
        Task<OperationResultDto> AddBalanceAsync(string guideId, string adminId, GuideWalletAdjustmentDto dto, string? ipAddress);
        Task<OperationResultDto> DeductBalanceAsync(string guideId, string adminId, GuideWalletAdjustmentDto dto, string? ipAddress);
        Task<OperationResultDto> SetFreezeStateAsync(string guideId, bool freeze, string adminId, string reason, string? ipAddress);
    }
}
