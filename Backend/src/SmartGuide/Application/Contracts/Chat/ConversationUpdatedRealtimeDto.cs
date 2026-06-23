using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ConversationUpdatedRealtimeDto
    {
        public Guid ConversationId { get; set; }

        public string? LastMessagePreview { get; set; }

        public DateTime? LastMessageSentAtUtc { get; set; }

        public bool IsEdited { get; set; }

        public bool IsDeleted { get; set; }
    }
}
