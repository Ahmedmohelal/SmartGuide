using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Chat
{
    public class ConversationSummaryDto
    {
        public Guid Id { get; set; }
        public string TouristUserId { get; set; } = null!;
        public string GuideUserId { get; set; } = null!;
        public DateTime CreatedAtUtc { get; set; }
        public DateTime? UpdatedAtUtc { get; set; }
        public string?  ProfilePictureUrl { get; set; }
        public string? FullName { get; set; }
        public string? LastMessagePreview { get; set; }
        public DateTime? LastMessageSentAtUtc { get; set; }
        public int UnreadCount { get; set; }
        public bool IsMessagingBlocked { get; set; }
    }

    public class ConversationDetailDto : ConversationSummaryDto
    {
        public string? OtherPartyUserId { get; set; }
        public string? OtherPartyDisplayName { get; set; }
        public string? OtherPartyProfilePictureUrl { get; set; }
    }

    public class PagedResultDto<T>
    {
        public IReadOnlyList<T> Items { get; set; } = Array.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
    }

    public class ChatMessageResponseDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public string SenderUserId { get; set; } = null!;
        public string Content { get; set; } = null!;
        public string DisplayContent { get; set; } = null!;
        public DateTime SentAtUtc { get; set; }
        public DateTime? DeliveredAtUtc { get; set; }
        public DateTime? SeenAtUtc { get; set; }
        public ChatMessageStatus Status { get; set; }
        public bool IsEdited { get; set; }
        public DateTime? EditedAtUtc { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAtUtc { get; set; }
    }

    public class CreateOrGetConversationRequestDto
    {
        /// <summary>User id of the other party (tourist sends guide id, guide sends tourist id).</summary>
        public string OtherPartyUserId { get; set; } = null!;
    }

    public class SendChatMessageRequestDto
    {
        public string Content { get; set; } = null!;
    }

    public class EditChatMessageRequestDto
    {
        public string Content { get; set; } = null!;
    }
}
