using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Chat
{
    public static class ChatConstants
    {
        public const string DeletedMessagePlaceholder = "This message was deleted";
        public static readonly TimeSpan EditOrDeleteWindow = TimeSpan.FromMinutes(5);
        public const int MaxMessageLength = 4000;
        public const int DefaultPageSize = 30;
        public const int MaxPageSize = 100;
    }
}
