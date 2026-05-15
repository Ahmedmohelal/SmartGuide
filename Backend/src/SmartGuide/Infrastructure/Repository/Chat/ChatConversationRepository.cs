using Domain.Entities.Chat;
using Domain.Interfaces.Chat;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repository.Chat
{
    public class ChatConversationRepository : IChatConversationRepository
    {
        private readonly ApplicationDbContext _db;

        public ChatConversationRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default)
        {
            await _db.ChatConversations.AddAsync(conversation, cancellationToken);
        }

        public async Task AddParticipantAsync(ConversationParticipant participant, CancellationToken cancellationToken = default)
        {
            await _db.ChatConversationParticipants.AddAsync(participant, cancellationToken);
        }

        public async Task<Conversation?> GetByIdWithParticipantsAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _db.ChatConversations.AsNoTracking()
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);
        }

        public async Task<Conversation?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
        {
            return await _db.ChatConversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted, cancellationToken);
        }

        public async Task<Conversation?> GetByTouristAndGuideAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatConversations
                .Include(c => c.Participants)
                .FirstOrDefaultAsync(c =>
                        !c.IsDeleted
                        && c.TouristUserId == touristUserId
                        && c.GuideUserId == guideUserId,
                    cancellationToken);
        }

        public async Task<IReadOnlyList<Conversation>> ListForUserAsync(string userId, int skip, int take, CancellationToken cancellationToken = default)
        {
            return await _db.ChatConversations.AsNoTracking()
                .Where(c => !c.IsDeleted && (c.TouristUserId == userId || c.GuideUserId == userId))
                .OrderByDescending(c => c.UpdatedAtUtc ?? c.CreatedAtUtc)
                .Skip(skip)
                .Take(take)
                .ToListAsync(cancellationToken);
        }

        public async Task<int> CountForUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatConversations.AsNoTracking()
                .CountAsync(c => !c.IsDeleted && (c.TouristUserId == userId || c.GuideUserId == userId), cancellationToken);
        }

        public async Task<IReadOnlyList<string>> GetDistinctPartnerUserIdsAsync(string userId, CancellationToken cancellationToken = default)
        {
            var rows = await _db.ChatConversations.AsNoTracking()
                .Where(c => !c.IsDeleted && (c.TouristUserId == userId || c.GuideUserId == userId))
                .Select(c => c.TouristUserId == userId ? c.GuideUserId : c.TouristUserId)
                .Distinct()
                .ToListAsync(cancellationToken);

            return rows;
        }

        public void Update(Conversation conversation)
        {
            _db.ChatConversations.Update(conversation);
        }
    }
}
