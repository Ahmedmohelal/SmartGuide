using Domain.Entities.Notifications;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Notifications
{
    public class NotificationDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public string? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
        public DateTime CreatedAtUtc { get; set; }
    }
}
