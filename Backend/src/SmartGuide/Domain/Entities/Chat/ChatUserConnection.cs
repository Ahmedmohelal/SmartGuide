using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Chat
{
    public class ChatUserConnection
    {
        public Guid Id { get; set; }
        public string UserId { get; set; } = null!;
        public string ConnectionId { get; set; } = null!;

        public DateTime ConnectedAtUtc { get; set; }
        public DateTime? DisconnectedAtUtc { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAtUtc { get; set; }
    }
}
