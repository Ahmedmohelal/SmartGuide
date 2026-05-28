using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IAdminAuditService
    {
        Task WriteAsync(string adminId, string action, string entityType, string entityId, string? details, string? ipAddress);
        Task<Pagination<AdminAuditLogDto>> GetRecentAsync(AuditLogSpecParams param);
    }
}
