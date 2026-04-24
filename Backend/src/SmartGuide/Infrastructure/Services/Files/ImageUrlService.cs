using Application.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Files
{
    public sealed class ImageUrlService : IImageUrlService
    {
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IWebHostEnvironment _env;

        public ImageUrlService(
            IConfiguration configuration,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment env)
        {
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _env = env;
        }

        public string? ToPublicImageUrl(string? value, params string[] candidateFolders)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            value = value.Trim();

            // Already an absolute URL.
            if (Uri.TryCreate(value, UriKind.Absolute, out var absolute) &&
                (absolute.Scheme == Uri.UriSchemeHttp || absolute.Scheme == Uri.UriSchemeHttps))
            {
                return value;
            }

            // Already a web-relative path.
            if (value.StartsWith("/", StringComparison.Ordinal))
                return CombineBaseUrlWithPath(value);

            // Try to resolve folder by checking file existence.
            var folder = ResolveExistingFolder(value, candidateFolders);

            // Default to the first candidate (or empty) when we can't resolve.
            folder ??= candidateFolders?.FirstOrDefault();

            var relativePath = string.IsNullOrWhiteSpace(folder)
                ? $"/images/{value}"
                : $"/images/{folder}/{value}";

            return CombineBaseUrlWithPath(relativePath);
        }

        private string? ResolveExistingFolder(string fileName, string[]? candidateFolders)
        {
            if (candidateFolders == null || candidateFolders.Length == 0)
                return null;

            // If WebRootPath isn't available (rare), skip file probing.
            if (string.IsNullOrWhiteSpace(_env.WebRootPath))
                return null;

            foreach (var folder in candidateFolders.Where(f => !string.IsNullOrWhiteSpace(f)))
            {
                var fullPath = Path.Combine(_env.WebRootPath, "images", folder, fileName);
                if (File.Exists(fullPath))
                    return folder;
            }

            return null;
        }

        private string CombineBaseUrlWithPath(string path)
        {
            var baseUrl = GetBaseUrl();
            return $"{baseUrl}{path}";
        }

        private string GetBaseUrl()
        {
            var fromConfig = _configuration["BaseUrl"];
            if (!string.IsNullOrWhiteSpace(fromConfig))
                return fromConfig.Trim().TrimEnd('/');

            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return "http://localhost"; // fallback when called outside HTTP context

            return $"{request.Scheme}://{request.Host}".TrimEnd('/');
        }
    }
}
