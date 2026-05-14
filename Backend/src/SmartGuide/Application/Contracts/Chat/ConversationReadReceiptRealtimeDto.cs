using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ConversationReadReceiptRealtimeDto
    {
        public Guid ConversationId { get; set; }
        public string ReaderUserId { get; set; } = null!;
        public DateTime SeenAtUtc { get; set; }
        public IReadOnlyList<Guid> MessageIds { get; set; } = Array.Empty<Guid>();
    }
}
