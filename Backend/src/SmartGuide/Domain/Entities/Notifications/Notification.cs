using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Notifications
{
    public class Notification
    {
        public Guid Id { get; set; }
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public NotificationType NotificationType { get; set; }
        public string? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;


    }
}
