using Domain.Entities.Chat;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces.Chat
{
    public interface IChatUserConnectionRepository
    {
        Task AddAsync(ChatUserConnection connection, CancellationToken cancellationToken = default);
        Task<ChatUserConnection?> GetActiveByConnectionIdAsync(string connectionId, CancellationToken cancellationToken = default);
        Task<bool> HasActiveConnectionAsync(string userId, CancellationToken cancellationToken = default);
        Task<int> ActiveConnectionCountAsync(string userId, CancellationToken cancellationToken = default);
        Task DisconnectAsync(string connectionId, DateTime disconnectedAtUtc, CancellationToken cancellationToken = default);
    }
}
