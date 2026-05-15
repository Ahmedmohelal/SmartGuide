using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Contracts.Chat
{
    public interface IChatClient
    {
        Task ReceiveChatMessage(ChatMessageRealtimeDto message);
        Task ChatMessageEdited(ChatMessageEditedRealtimeDto dto);
        Task ChatMessageDeleted(ChatMessageDeletedRealtimeDto dto);
        Task ChatMessageStatusUpdated(ChatMessageStatusRealtimeDto dto);
        Task ConversationReadReceipt(ConversationReadReceiptRealtimeDto dto);
        Task UserPresenceChanged(UserPresenceRealtimeDto dto);
    }
}
