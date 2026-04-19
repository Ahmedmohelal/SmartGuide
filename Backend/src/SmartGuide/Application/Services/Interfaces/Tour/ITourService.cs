using Application.DTOs.Tour;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Tour
{
    public interface ITourService
    {
        public Task<List<TourListItemDto>> GetGuideToursAsync(string guideId);


    }
}
