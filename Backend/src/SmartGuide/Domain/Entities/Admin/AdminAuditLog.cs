using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Admin
{
    public class AdminAuditLog
    {
        public Guid Id { get; set; }
        public string AdminId { get; set; } = null!;
        public string Action { get; set; } = null!;
        public string EntityType { get; set; } = null!;
        public string EntityId { get; set; } = null!;
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
