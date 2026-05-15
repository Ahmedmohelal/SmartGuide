using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces.Chat
{
    public interface IChatMessageRepository
    {
        Task<ChatMessage?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<ChatMessage>> GetPageAsync(Guid conversationId, DateTime? beforeSentAtUtc, int take, CancellationToken cancellationToken = default);
        Task AddAsync(ChatMessage message, CancellationToken cancellationToken = default);
        void Update(ChatMessage message);
        Task MarkBulkSeenAsync(Guid conversationId, string recipientUserId, DateTime seenAtUtc, CancellationToken cancellationToken = default);
        Task MarkBulkDeliveredForRecipientAsync(string recipientUserId, DateTime deliveredAtUtc, CancellationToken cancellationToken = default);
        Task<ChatMessage?> GetLatestNonDeletedAsync(Guid conversationId, CancellationToken cancellationToken = default);
        Task<Dictionary<Guid, int>> GetUnreadCountsAsync(IEnumerable<Guid> conversationIds, string forUserId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Guid>> GetUnreadIncomingMessageIdsAsync(Guid conversationId, string readerUserId, CancellationToken cancellationToken = default);
    }
}
