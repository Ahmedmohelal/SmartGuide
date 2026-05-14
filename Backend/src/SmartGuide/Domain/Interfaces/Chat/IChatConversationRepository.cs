using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces.Chat
{
    public interface IChatConversationRepository
    {
        Task<Conversation?> GetByIdWithParticipantsAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Conversation?> GetByIdForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
        Task<Conversation?> GetByTouristAndGuideAsync(string touristUserId, string guideUserId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<Conversation>> ListForUserAsync(string userId, int skip, int take, CancellationToken cancellationToken = default);
        Task<int> CountForUserAsync(string userId, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<string>> GetDistinctPartnerUserIdsAsync(string userId, CancellationToken cancellationToken = default);
        Task AddAsync(Conversation conversation, CancellationToken cancellationToken = default);
        Task AddParticipantAsync(ConversationParticipant participant, CancellationToken cancellationToken = default);
        void Update(Conversation conversation);
    }
}
