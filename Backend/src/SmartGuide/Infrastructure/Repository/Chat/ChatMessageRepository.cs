using Domain.Entities.Chat;
using Domain.Interfaces.Chat;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Chat
{
    public class ChatMessageRepository : IChatMessageRepository
    {
        private readonly ApplicationDbContext _db;

        public ChatMessageRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(ChatMessage message, CancellationToken cancellationToken = default)
        {
            await _db.ChatMessages.AddAsync(message, cancellationToken);
        }

        public async Task<ChatMessage?> GetByIdAsync(Guid messageId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatMessages
                .Include(m => m.Conversation)
                .FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);
        }

        public async Task<IReadOnlyList<ChatMessage>> GetPageAsync(Guid conversationId, DateTime? beforeSentAtUtc, int take, CancellationToken cancellationToken = default)
        {
            var q = _db.ChatMessages.AsNoTracking()
                .Where(m => m.ConversationId == conversationId);

            if (beforeSentAtUtc.HasValue)
                q = q.Where(m => m.SentAtUtc < beforeSentAtUtc.Value);

            return await q
                .OrderByDescending(m => m.SentAtUtc)
                .Take(take)
                .ToListAsync(cancellationToken);
        }

        public void Update(ChatMessage message)
        {
            _db.ChatMessages.Update(message);
        }

        public async Task MarkBulkSeenAsync(Guid conversationId, string recipientUserId, DateTime seenAtUtc, CancellationToken cancellationToken = default)
        {
            await _db.ChatMessages
                .Where(m => m.ConversationId == conversationId
                            && !m.IsDeleted
                            && m.SenderUserId != recipientUserId
                            && m.SeenAtUtc == null)
                .ExecuteUpdateAsync(setters => setters
                        .SetProperty(m => m.DeliveredAtUtc, m => m.DeliveredAtUtc ?? seenAtUtc)
                        .SetProperty(m => m.SeenAtUtc, seenAtUtc)
                        .SetProperty(m => m.Status, ChatMessageStatus.Seen),
                    cancellationToken);
        }

        public async Task MarkBulkDeliveredForRecipientAsync(string recipientUserId, DateTime deliveredAtUtc, CancellationToken cancellationToken = default)
        {
            var conversationIds = _db.ChatConversations.AsNoTracking()
                .Where(c => !c.IsDeleted && (c.TouristUserId == recipientUserId || c.GuideUserId == recipientUserId))
                .Select(c => c.Id);

            await _db.ChatMessages
                .Where(m => !m.IsDeleted
                            && m.DeliveredAtUtc == null
                            && m.SenderUserId != recipientUserId
                            && conversationIds.Contains(m.ConversationId))
                .ExecuteUpdateAsync(setters => setters
                        .SetProperty(m => m.DeliveredAtUtc, deliveredAtUtc)
                        .SetProperty(m => m.Status, ChatMessageStatus.Delivered),
                    cancellationToken);
        }

        public async Task<ChatMessage?> GetLatestNonDeletedAsync(Guid conversationId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatMessages.AsNoTracking()
                .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
                .OrderByDescending(m => m.SentAtUtc)
                .FirstOrDefaultAsync(cancellationToken);
        }

        public async Task<Dictionary<Guid, int>> GetUnreadCountsAsync(IEnumerable<Guid> conversationIds, string forUserId, CancellationToken cancellationToken = default)
        {
            var ids = conversationIds.Distinct().ToList();
            if (ids.Count == 0)
                return new Dictionary<Guid, int>();

            var rows = await _db.ChatMessages.AsNoTracking()
                .Where(m => ids.Contains(m.ConversationId) && !m.IsDeleted && m.SenderUserId != forUserId && m.SeenAtUtc == null)
                .GroupBy(m => m.ConversationId)
                .Select(g => new { ConvId = g.Key, Cnt = g.Count() })
                .ToListAsync(cancellationToken);

            return rows.ToDictionary(x => x.ConvId, x => x.Cnt);
        }

        public async Task<IReadOnlyList<Guid>> GetUnreadIncomingMessageIdsAsync(Guid conversationId, string readerUserId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatMessages.AsNoTracking()
                .Where(m => m.ConversationId == conversationId && !m.IsDeleted && m.SenderUserId != readerUserId && m.SeenAtUtc == null)
                .Select(m => m.Id)
                .ToListAsync(cancellationToken);
        }
    }
}
