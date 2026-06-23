using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Cashing
{
    public interface IRedisCacheService
    {
        Task<T?> GetAsync<T>(string key);

        Task SetAsync<T>(
            string key,
            T value,
            TimeSpan expiration);

        Task RemoveAsync(string key);
    }
}
