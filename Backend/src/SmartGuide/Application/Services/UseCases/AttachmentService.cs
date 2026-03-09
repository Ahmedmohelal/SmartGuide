using Application.Services.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases
{
    public class AttachmentService : IAttachmentService
    {

        private readonly string[] allowedExentions = { ".jpg", ".jpeg", ".png" };
        private readonly long maxFileSize = 5 * 1024 * 1024; // 5 MB
        private readonly IWebHostEnvironment webHost;

        public AttachmentService(IWebHostEnvironment _webHost)
        {
            webHost = _webHost;
        }


        public async Task<string?> Upload(string folderName, IFormFile file)
        {
            try
            {
                if (folderName is null || file is null || file.Length == 0) return null;

                if (file.Length > maxFileSize) return null;

                // test.png
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExentions.Contains(fileExtension)) return null;

                var FolderPath = Path.Combine(webHost.WebRootPath, "images", folderName);
                if (!Directory.Exists(FolderPath)) Directory.CreateDirectory(FolderPath);

                var fileName = Guid.NewGuid().ToString() + fileExtension;

                // wwwroot/images/folderName/uniqueFileName.extension   
                var filePath = Path.Combine(FolderPath, fileName);

                using var fileStream = new FileStream(filePath, FileMode.Create);

                file.CopyTo(fileStream);

                return fileName;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed To Upload File To Folder {folderName} : {ex}");
                return null;
            }
        }
    
        public async Task<bool> Delete(string fileName, string folderName)
        {
            try
            {

                if (string.IsNullOrEmpty(fileName) || string.IsNullOrEmpty(folderName)) return false;

                var FullPath = Path.Combine(webHost.WebRootPath, "images", folderName, fileName);

                if (File.Exists(FullPath))
                {
                    File.Delete(FullPath);
                    return true;
                }
                return false;

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed To Delete File With Name {fileName} : {ex}");
                return false;
            }
        }
    }

}
