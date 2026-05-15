using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Chat
{
    public enum ChatMessageStatus
    {
        Sent = 0,
        Delivered = 1,
        Seen = 2
    }
}
