using Application.DTOs.AdminDashboard;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IAdminAuditService
    {
        Task WriteAsync(string adminId, string action, string entityType, string entityId, string? details, string? ipAddress);
        Task<List<AdminAuditLogDto>> GetRecentAsync(int take = 100);
    }
}
