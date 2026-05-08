using Application.DTOs.AdminDashboard;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IAdminDashboardService
    {
        Task<AdminStatisticsDto> GetStatisticsAsync();
        Task<AdminRevenueDto> GetRevenueAsync();
    }
}
