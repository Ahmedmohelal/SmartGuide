using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ChatMessageEditedRealtimeDto
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public string Content { get; set; } = null!;
        public DateTime EditedAtUtc { get; set; }
        public bool IsEdited { get; set; } = true;
    }
}
