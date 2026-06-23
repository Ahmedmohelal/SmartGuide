using API.Attributes;
using Application.Services.Interfaces.Cashing;
using Microsoft.AspNetCore.Mvc.Controllers;
using System.Text;

namespace API.Middleware;

public class RedisCacheMiddleware
{
    private readonly RequestDelegate _next;

    public RedisCacheMiddleware(
        RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(
        HttpContext context,
        IRedisCacheService cache)
    {
        var endpoint = context.GetEndpoint();

        var cacheAttribute = endpoint?
            .Metadata
            .GetMetadata<RedisCacheAttribute>();

        var cacheKey = GenerateCacheKey(context);

        if (cacheAttribute is null)
        {
            await _next(context);
            return;
        }

        var cachedResponse =
            await cache.GetAsync<string>(
                cacheKey);

        if (!string.IsNullOrEmpty(
            cachedResponse))
        {
            context.Response.ContentType =
                "application/json";

            await context.Response.WriteAsync(
                cachedResponse);

            Console.WriteLine( $"CACHE HIT => {cacheKey}");

            return;
        }

        var originalBody =
            context.Response.Body;

        using var memoryStream =
            new MemoryStream();

        context.Response.Body =
            memoryStream;

        Console.WriteLine($"CACHE MISS => {cacheKey}");
        await _next(context);

        memoryStream.Position = 0;

        var responseBody =
            await new StreamReader(
                memoryStream)
            .ReadToEndAsync();

        if (context.Response.StatusCode == 200)
        {
            await cache.SetAsync(
                cacheKey,
                responseBody,
                TimeSpan.FromSeconds(
                    cacheAttribute
                        .ExpirationSeconds));
        }

        memoryStream.Position = 0;

        await memoryStream.CopyToAsync(
            originalBody);

        context.Response.Body =
            originalBody;
    }

    private static string GenerateCacheKey(
        HttpContext context)
    {
        var key = new StringBuilder();

        key.Append(
            context.Request.Path);

        foreach (var query in context.Request.Query.OrderBy(x => x.Key))
        {
            key.Append(
                $"|{query.Key}:{query.Value}");
        }

        return key.ToString();
    }
}