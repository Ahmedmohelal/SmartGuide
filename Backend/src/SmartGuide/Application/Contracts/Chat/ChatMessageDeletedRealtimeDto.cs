using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ChatMessageDeletedRealtimeDto
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public string DisplayContent { get; set; } = null!;
        public DateTime DeletedAtUtc { get; set; }
    }
}
