using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Chat
{
    public class Conversation
    {
        public Guid Id { get; set; }

        public string TouristUserId { get; set; } = null!;
        public string GuideUserId { get; set; } = null!;

        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }

        public string? LastMessagePreview { get; set; }
        public DateTime? LastMessageSentAtUtc { get; set; }

        public bool IsDeleted { get; set; }
        public DateTime? DeletedAtUtc { get; set; }

        public bool IsMessagingBlocked { get; set; }
        public DateTime? MessagingBlockedAtUtc { get; set; }
        public string? MessagingBlockedByGuideUserId { get; set; }

        public ICollection<ConversationParticipant> Participants { get; set; } = new List<ConversationParticipant>();
        public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
    }
}
