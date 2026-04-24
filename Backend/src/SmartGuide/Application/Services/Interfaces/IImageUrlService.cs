using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface IImageUrlService
    {
        string? ToPublicImageUrl(string? value, params string[] candidateFolders);
    }
}
