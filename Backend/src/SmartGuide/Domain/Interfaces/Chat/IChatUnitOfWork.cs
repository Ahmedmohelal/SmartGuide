using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces.Chat
{
    public interface IChatUnitOfWork
    {
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
