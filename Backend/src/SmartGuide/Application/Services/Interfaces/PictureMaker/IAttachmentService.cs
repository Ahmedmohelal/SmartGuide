using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.PictureMaker
{
    public interface IAttachmentService
    {
        Task<string?> Upload(string folderName, IFormFile file);
        Task<bool> Delete(string fileName, string folderName);


    }
}
