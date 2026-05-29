using Application.Services.Interfaces.Cashing;
using StackExchange.Redis;
using System.Text.Json;

namespace Infrastructure.Services.Caching;

public class RedisCacheService
    : IRedisCacheService
{
    private readonly IDatabase _database;

    public RedisCacheService(
        IConnectionMultiplexer redis)
    {
        _database = redis.GetDatabase();
    }

    public async Task<T?> GetAsync<T>(string key)
    {
        var value =
            await _database.StringGetAsync(key);

        if (value.IsNullOrEmpty)
            return default;

        var json = value.ToString();

        return JsonSerializer.Deserialize<T>(json);
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan expiration)
    {
        var json =
            JsonSerializer.Serialize(value);

        await _database.StringSetAsync(
            key,
            json,
            expiration);
    }

    public async Task RemoveAsync(
        string key)
    {
        await _database.KeyDeleteAsync(key);
    }
}