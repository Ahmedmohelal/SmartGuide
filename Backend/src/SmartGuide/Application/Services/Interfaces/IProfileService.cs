using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface IProfileService
    {
        Task<TourGuideProfileDto> GetProfileAsync(string userId);
    }
}
