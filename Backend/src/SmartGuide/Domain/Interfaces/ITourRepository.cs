using Domain.Entities.Tours;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces
{
    public interface ITourRepository
    {
        public Task<List<Tour>> GetGuideToursAsync(string guideId);
        public Task<Tour?> GetByIdAsync(Guid tourId);
        public Task AddAsync(Tour tour);

        public Task UpdateAsync(Tour tour);
        Task ReplaceTourRelationsAsync(Tour tour,List<TourStops> stops,List<TourInclusion> inclusions,List<TourAddOn> addons);

        Task ReplaceTourImagesAsync(Tour tour, List<TourImage> images);
        public Task DeleteAsync(Guid tourId);

    }
}
