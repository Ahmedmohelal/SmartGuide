using Application.Services.Interfaces.PictureMaker;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

namespace Infrastructure.Services.Files
{
    public class CloudinaryAttachmentService : IAttachmentService
    {
        private readonly Cloudinary _cloudinary;
        private readonly IWebHostEnvironment _environment;

        private readonly string[] _allowedExtensions =
        {
            ".jpg",
            ".jpeg",
            ".png"
        };

        private const long MaxFileSize = 5 * 1024 * 1024;

        public CloudinaryAttachmentService(
            IOptions<CloudinarySettings> options,
            IWebHostEnvironment environment)
        {
            _environment = environment;

            var settings = options.Value;

            var account = new Account(
                settings.CloudName,
                settings.ApiKey,
                settings.ApiSecret);

            _cloudinary = new Cloudinary(account);
        }

        public async Task<string?> Upload(
            string folderName,
            IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return null;

                if (file.Length > MaxFileSize)
                    return null;

                var extension =
                    Path.GetExtension(file.FileName)
                        .ToLowerInvariant();

                if (!_allowedExtensions.Contains(extension))
                    return null;

                await using var stream =
                    file.OpenReadStream();

                var uploadParams =
                    new ImageUploadParams
                    {
                        File = new FileDescription(
                            file.FileName,
                            stream),

                        Folder = $"SmartGuide/{folderName}"
                    };

                var result =
                    await _cloudinary.UploadAsync(
                        uploadParams);

                if (result.Error != null)
                    return null;

                return result.SecureUrl?.ToString();
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> Delete(
            string fileNameOrUrl,
            string folderName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fileNameOrUrl))
                    return true;

                if (Uri.TryCreate(
                    fileNameOrUrl,
                    UriKind.Absolute,
                    out var uri))
                {
                    var segments =
                        uri.AbsolutePath.Split(
                            '/',
                            StringSplitOptions.RemoveEmptyEntries);

                    var uploadIndex =
                        Array.IndexOf(
                            segments,
                            "upload");

                    if (uploadIndex >= 0)
                    {
                        var publicIdParts =
                            segments
                                .Skip(uploadIndex + 2)
                                .ToArray();

                        var publicId =
                            string.Join(
                                "/",
                                publicIdParts);

                        var extension =
                            Path.GetExtension(publicId);

                        if (!string.IsNullOrWhiteSpace(extension))
                        {
                            publicId =
                                publicId[..^extension.Length];
                        }

                        var deleteResult =
                            await _cloudinary.DestroyAsync(
                                new DeletionParams(publicId));

                        return deleteResult.Result == "ok"
                            || deleteResult.Result == "not found";
                    }
                }


                if (!string.IsNullOrWhiteSpace(
                    _environment.WebRootPath))
                {
                    var fullPath =
                        Path.Combine(
                            _environment.WebRootPath,
                            "images",
                            folderName,
                            fileNameOrUrl);

                    if (File.Exists(fullPath))
                    {
                        File.Delete(fullPath);
                    }
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}