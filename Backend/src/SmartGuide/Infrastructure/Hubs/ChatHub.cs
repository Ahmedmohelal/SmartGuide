using Application.Contracts.Chat;
using Application.Services.Interfaces.Chat;
using Infrastructure.Chat;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Infrastructure.Hubs
{
    [Authorize]
    public sealed class ChatHub : Hub<IChatClient>
    {
        public const string RoutePath = "/hubs/chat";

        private readonly IChatService _chatService;

        public ChatHub(IChatService chatService)
        {
            _chatService = chatService;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
                await _chatService.RegisterConnectionAsync(userId, Context.ConnectionId, Context.ConnectionAborted);

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.Items["joinedConversations"] is List<Guid> joined)
            {
                foreach (var id in joined)
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, HubGroupNames.Conversation(id));
                }
            }

            await _chatService.HandleDisconnectedAsync(Context.ConnectionId, Context.ConnectionAborted);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinConversation(Guid conversationId)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId))
                throw new HubException("UNAUTHORIZED");

            if (!await _chatService.IsParticipantAsync(userId, conversationId, Context.ConnectionAborted))
                throw new HubException("FORBIDDEN");

            await Groups.AddToGroupAsync(Context.ConnectionId, HubGroupNames.Conversation(conversationId));

            if (Context.Items["joinedConversations"] is not List<Guid> list)
            {
                list = new List<Guid>();
                Context.Items["joinedConversations"] = list;
            }

            if (!list.Contains(conversationId))
                list.Add(conversationId);
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, HubGroupNames.Conversation(conversationId));
            if (Context.Items["joinedConversations"] is List<Guid> list)
                list.Remove(conversationId);
        }
    }
}
