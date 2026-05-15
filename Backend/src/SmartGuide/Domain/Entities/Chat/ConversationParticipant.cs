using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Chat
{
    public class ConversationParticipant
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public string UserId { get; set; } = null!;
        public ChatParticipantRole Role { get; set; }

        public DateTime JoinedAtUtc { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAtUtc { get; set; }

        public Conversation Conversation { get; set; } = null!;
    }
}
