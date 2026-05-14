using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Chat
{
    public interface IChatUserReader
    {
        Task<UserChatContext?> GetAsync(string userId, CancellationToken cancellationToken = default);
    }

    public sealed class UserChatContext
    {
        public string UserId { get; init; } = null!;
        public string Role { get; init; } = null!;
        public string DisplayName { get; init; } = null!;
    }

}
