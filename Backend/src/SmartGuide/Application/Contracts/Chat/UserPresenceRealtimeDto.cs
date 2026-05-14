using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class UserPresenceRealtimeDto
    {
        public string UserId { get; set; } = null!;
        public bool IsOnline { get; set; }
        public DateTime OccurredAtUtc { get; set; }
    }
}
