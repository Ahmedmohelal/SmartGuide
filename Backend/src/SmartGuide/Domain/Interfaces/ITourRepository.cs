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
        public Task ReplaceTourRelationsAsync(Tour tour, List<TourStops> stops, List<TourInclusion> inclusions, List<TourAddOn> addons);

        public Task ReplaceTourImagesAsync(Tour tour, List<TourImage> images);
        public Task DeleteAsync(Guid tourId);

        public Task<List<Tour>> GetToursByPlaceAsync(int placeId);
        Task<List<Tour>> GetAllActiveToursAsync();
    }
}
