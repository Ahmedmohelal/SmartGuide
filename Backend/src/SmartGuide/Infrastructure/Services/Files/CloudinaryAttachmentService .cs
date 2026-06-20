using Application.Services.Interfaces.PictureMaker;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Infrastructure.Services.Files
{
    public class CloudinaryAttachmentService : IAttachmentService
    {
        private readonly Cloudinary _cloudinary;

        private readonly string[] allowedExtensions =
        {
        ".jpg",
        ".jpeg",
        ".png"
    };

        private readonly long maxFileSize = 5 * 1024 * 1024;

        public CloudinaryAttachmentService(IOptions<CloudinarySettings> options)
        {
            var settings = options.Value;

            var account = new Account(
                settings.CloudName,
                settings.ApiKey,
                settings.ApiSecret);

            _cloudinary = new Cloudinary(account);
        }

        public async Task<string?> Upload(string folderName, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return null;

                if (file.Length > maxFileSize)
                    return "The File Must Be Less Than 5 MB";

                var extension =
                    Path.GetExtension(file.FileName)
                        .ToLower();

                if (!allowedExtensions.Contains(extension))
                    return "The File Must Be A JPG, JPEG, Or PNG";

                await using var stream = file.OpenReadStream();

                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(
                            file.FileName,
                            stream),

                    Folder = $"SmartGuide/{folderName}"
                };

                var result = await _cloudinary.UploadAsync(uploadParams);

                if (result.Error != null)
                    return null;

                return result.SecureUrl.ToString();
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> Delete(
    string fileUrl,
    string folderName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(fileUrl))
                    return false;

                var uri = new Uri(fileUrl);

                var segments = uri.AbsolutePath.Split('/');

                var uploadIndex = Array.IndexOf(segments, "upload");

                if (uploadIndex == -1)
                    return false;

                var publicIdParts = segments
                    .Skip(uploadIndex + 2) // skip upload + version
                    .ToArray();

                var publicId = string.Join("/", publicIdParts);

                var extension = Path.GetExtension(publicId);

                if (!string.IsNullOrEmpty(extension))
                {
                    publicId = publicId[..^extension.Length];
                }

                var deleteParams = new DeletionParams(publicId);

                var result =
                    await _cloudinary.DestroyAsync(deleteParams);

                return result.Result == "ok";
            }
            catch
            {
                return false;
            }
        }
    }
}
