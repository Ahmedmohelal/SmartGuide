using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminAuditLogDto
    {
        public Guid Id { get; set; }
        public string AdminId { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}

