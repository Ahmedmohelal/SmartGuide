using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.Home;
using Application.Services.Interfaces.Admin;
using Domain.Entities.Admin;
using Infrastructure.Data;
using Infrastructure.Services.Admin.Specs;
using Infrastructure.Services.Home;
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

        public async Task<Pagination<AdminAuditLogDto>>
    GetRecentAsync(
        AuditLogSpecParams param)
        {
            var spec =
                new AuditLogsSpecification(
                    param);

            var countSpec =
                new AuditLogsCountSpecification(
                    param);

            var logsQuery =
                SpecificationEvaluator<AdminAuditLog>
                    .GetQuery(
                        _context.AdminAuditLogs
                            .AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<AdminAuditLog>
                    .GetQuery(
                        _context.AdminAuditLogs
                            .AsQueryable(),
                        countSpec);

            var logs = await logsQuery

                .AsNoTracking()

                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var mappedLogs = logs
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

                }).ToList();

            return new Pagination<AdminAuditLogDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mappedLogs);
        }
    }
}
