using Domain.Entities.Chat;
using Domain.Interfaces.Chat;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Chat
{
    public class ChatUserConnectionRepository : IChatUserConnectionRepository
    {
        private readonly ApplicationDbContext _db;

        public ChatUserConnectionRepository(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task AddAsync(ChatUserConnection connection, CancellationToken cancellationToken = default)
        {
            await _db.ChatUserConnections.AddAsync(connection, cancellationToken);
        }

        public async Task<ChatUserConnection?> GetActiveByConnectionIdAsync(string connectionId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatUserConnections
                .FirstOrDefaultAsync(c =>
                        c.ConnectionId == connectionId
                        && !c.IsDeleted
                        && c.DisconnectedAtUtc == null,
                    cancellationToken);
        }

        public async Task<bool> HasActiveConnectionAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatUserConnections.AsNoTracking()
                .AnyAsync(c => c.UserId == userId && !c.IsDeleted && c.DisconnectedAtUtc == null, cancellationToken);
        }

        public async Task<int> ActiveConnectionCountAsync(string userId, CancellationToken cancellationToken = default)
        {
            return await _db.ChatUserConnections.AsNoTracking()
                .CountAsync(c => c.UserId == userId && !c.IsDeleted && c.DisconnectedAtUtc == null, cancellationToken);
        }

        public async Task DisconnectAsync(string connectionId, DateTime disconnectedAtUtc, CancellationToken cancellationToken = default)
        {
            await _db.ChatUserConnections
                .Where(c => c.ConnectionId == connectionId && c.DisconnectedAtUtc == null)
                .ExecuteUpdateAsync(setters => setters
                        .SetProperty(c => c.DisconnectedAtUtc, disconnectedAtUtc),
                    cancellationToken);
        }
    }
}
