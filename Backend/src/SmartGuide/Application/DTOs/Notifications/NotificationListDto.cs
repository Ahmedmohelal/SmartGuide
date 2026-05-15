using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Notifications
{
    public class NotificationListDto
    {
        public List<NotificationDTO> Notifications { get; set; } = new();
        public int UnreadCount { get; set; }
        public int TotalCount { get; set; }
    }
}
