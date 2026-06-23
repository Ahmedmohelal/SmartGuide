namespace API.Attributes;

[AttributeUsage(AttributeTargets.Method)]
public sealed class RedisCacheAttribute : Attribute
{
    public int ExpirationSeconds { get; }

    public RedisCacheAttribute(int expirationSeconds = 300)
    {
        ExpirationSeconds = expirationSeconds;
    }
}