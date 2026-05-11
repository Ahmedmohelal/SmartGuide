using Application.DTOs.AdminDashboard;
using Application.Services.Interfaces.Admin;
using Domain.Entities.Admin;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Admin
{
    public class AdminAuditService : IAdminAuditService
    {
        private readonly ApplicationDbContext _context;

        public AdminAuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task WriteAsync(string adminId, string action, string entityType, string entityId, string? details, string? ipAddress)
        {
            var log = new AdminAuditLog
            {
                Id = Guid.NewGuid(),
                AdminId = adminId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Details = details,
                IpAddress = ipAddress
            };

            await _context.AdminAuditLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        public async Task<List<AdminAuditLogDto>> GetRecentAsync(int take = 100)
        {
            take = Math.Clamp(take, 1, 500);

            return await _context.AdminAuditLogs
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAtUtc)
                .Take(take)
                .Select(x => new AdminAuditLogDto
                {
                    Id = x.Id,
                    AdminId = x.AdminId,
                    Action = x.Action,
                    EntityType = x.EntityType,
                    EntityId = x.EntityId,
                    Details = x.Details,
                    IpAddress = x.IpAddress,
                    CreatedAtUtc = x.CreatedAtUtc
                })
                .ToListAsync();
        }
    }
}
