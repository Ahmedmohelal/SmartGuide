using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Chat
{
    public class ChatMessage
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public string SenderUserId { get; set; } = null!;

        public string Content { get; set; } = null!;

        public DateTime SentAtUtc { get; set; }
        public DateTime? DeliveredAtUtc { get; set; }
        public DateTime? SeenAtUtc { get; set; }

        public ChatMessageStatus Status { get; set; } = ChatMessageStatus.Sent;

        public bool IsEdited { get; set; }
        public DateTime? EditedAtUtc { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAtUtc { get; set; }

        public Conversation Conversation { get; set; } = null!;
    }
}
