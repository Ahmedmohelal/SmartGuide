using Application.Contracts.Chat;
using Application.Services.Interfaces.Chat;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Chat
{
    public sealed class ChatSignalRPublisher : IChatRealtimePublisher
    {
        private readonly IHubContext<ChatHub, IChatClient> _hubContext;

        public ChatSignalRPublisher(IHubContext<ChatHub, IChatClient> hubContext)
        {
            _hubContext = hubContext;
        }

        public Task PublishNewMessageAsync(Guid conversationId, ChatMessageRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.Group(HubGroupNames.Conversation(conversationId)).ReceiveChatMessage(dto);

        public Task PublishMessageEditedAsync(Guid conversationId, ChatMessageEditedRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.Group(HubGroupNames.Conversation(conversationId)).ChatMessageEdited(dto);

        public Task PublishMessageDeletedAsync(Guid conversationId, ChatMessageDeletedRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.Group(HubGroupNames.Conversation(conversationId)).ChatMessageDeleted(dto);

        public Task PublishMessageStatusAsync(Guid conversationId, ChatMessageStatusRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.Group(HubGroupNames.Conversation(conversationId)).ChatMessageStatusUpdated(dto);

        public Task PublishReadReceiptAsync(Guid conversationId, ConversationReadReceiptRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.Group(HubGroupNames.Conversation(conversationId)).ConversationReadReceipt(dto);

        public Task PublishPresenceAsync(string notifyUserId, UserPresenceRealtimeDto dto, CancellationToken cancellationToken = default) =>
            _hubContext.Clients.User(notifyUserId).UserPresenceChanged(dto);
    }
}
