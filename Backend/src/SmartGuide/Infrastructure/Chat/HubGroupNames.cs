using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Chat
{
    public static class HubGroupNames
    {
        public static string Conversation(Guid conversationId) => $"chat:conversation:{conversationId:N}";
    }
}
