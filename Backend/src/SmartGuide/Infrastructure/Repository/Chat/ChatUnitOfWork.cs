using Domain.Interfaces.Chat;
using Infrastructure.Data;

namespace Infrastructure.Repository.Chat
{
    public class ChatUnitOfWork : IChatUnitOfWork
    {
        private readonly ApplicationDbContext _db;

        public ChatUnitOfWork(ApplicationDbContext db)
        {
            _db = db;
        }

        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            _db.SaveChangesAsync(cancellationToken);
    }
}
