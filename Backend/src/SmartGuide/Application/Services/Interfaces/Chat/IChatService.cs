using Application.DTOs.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Chat
{
    public interface IChatService
    {
        Task<bool> IsParticipantAsync(string userId, Guid conversationId, CancellationToken cancellationToken = default);

        Task<ChatActionResult<ConversationDetailDto>> CreateOrGetConversationAsync(
            string requesterUserId,
            CreateOrGetConversationRequestDto request,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<PagedResultDto<ConversationSummaryDto>>> GetConversationsAsync(
            string userId,
            int page,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<ConversationDetailDto>> GetConversationDetailAsync(
            string userId,
            Guid conversationId,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<PagedResultDto<ChatMessageResponseDto>>> GetMessagesAsync(
            string userId,
            Guid conversationId,
            DateTime? beforeSentAtUtc,
            int pageSize,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<ChatMessageResponseDto>> SendMessageAsync(
            string senderUserId,
            Guid conversationId,
            SendChatMessageRequestDto request,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<ChatMessageResponseDto>> EditMessageAsync(
            string userId,
            Guid messageId,
            EditChatMessageRequestDto request,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<Unit>> DeleteMessageAsync(
            string userId,
            Guid messageId,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<Unit>> MarkConversationSeenAsync(
            string readerUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<Unit>> BlockTouristAsync(
            string guideUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default);

        Task<ChatActionResult<Unit>> UnblockTouristAsync(
            string guideUserId,
            Guid conversationId,
            CancellationToken cancellationToken = default);

        Task RegisterConnectionAsync(string userId, string connectionId, CancellationToken cancellationToken = default);

        Task HandleDisconnectedAsync(string connectionId, CancellationToken cancellationToken = default);
    }

    /// <summary>Marker for void success results.</summary>
    public readonly struct Unit
    {
        public static Unit Value => default;
    }
}
