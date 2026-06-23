using Application.Contracts.Chat;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;       

namespace Application.Services.Interfaces.Chat
{
    public interface IChatRealtimePublisher
    {
        Task PublishNewMessageAsync(Guid conversationId, ChatMessageRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishMessageEditedAsync(Guid conversationId, ChatMessageEditedRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishMessageDeletedAsync(Guid conversationId, ChatMessageDeletedRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishMessageStatusAsync(Guid conversationId, ChatMessageStatusRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishReadReceiptAsync(Guid conversationId, ConversationReadReceiptRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishPresenceAsync(string notifyUserId, UserPresenceRealtimeDto dto, CancellationToken cancellationToken = default);
        Task PublishConversationSummaryUpdatedAsync(Guid conversationId,ConversationUpdatedRealtimeDto dto,CancellationToken cancellationToken = default);
    }
}
