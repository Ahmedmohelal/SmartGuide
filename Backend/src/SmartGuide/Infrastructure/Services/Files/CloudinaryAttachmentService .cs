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

        public CloudinaryAttachmentService(
            IOptions<CloudinarySettings> options)
        {
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

                if (file.Length > maxFileSize)
                    return null;

                var extension =
                    Path.GetExtension(file.FileName)
                        .ToLower();

                if (!allowedExtensions.Contains(extension))
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
            return true;
        }
    }
}
