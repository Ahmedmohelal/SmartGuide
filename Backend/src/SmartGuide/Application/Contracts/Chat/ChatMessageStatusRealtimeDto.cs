using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public class ChatMessageStatusRealtimeDto
    {
        public Guid MessageId { get; set; }
        public Guid ConversationId { get; set; }
        public ChatMessageStatus Status { get; set; }
        public DateTime? DeliveredAtUtc { get; set; }
        public DateTime? SeenAtUtc { get; set; }
    }
}
