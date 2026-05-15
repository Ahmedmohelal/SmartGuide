using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ChatMessageRealtimeDto
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public string SenderUserId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime SentAtUtc { get; set; }
        public DateTime? DeliveredAtUtc { get; set; }
        public DateTime? SeenAtUtc { get; set; }
        public ChatMessageStatus Status { get; set; }
        public bool IsEdited { get; set; }
        public bool IsDeleted { get; set; }
    }
}
