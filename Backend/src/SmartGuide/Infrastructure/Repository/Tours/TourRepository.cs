using Domain.Entities.Tours;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Tours
{
    public class TourRepository : ITourRepository
    {
        private readonly ApplicationDbContext _context;

        public TourRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Tour tour)
        {
            await _context.Tours.AddAsync(tour);
            await _context.SaveChangesAsync();
        }


        public async Task<List<Tour>> GetGuideToursAsync(string guideId)
        {
            return await _context.Tours
                .Where(t => t.GuideId == guideId && t.IsActive)
                .Include(t => t.TourImages)
                .ToListAsync();
        }
        public async Task<List<Tour>> GetTouristToursAsync(string touristId)
        {
            return await _context.Bookings
        .Where(b => b.TouristId == touristId)
        .Where(b => b.Tour.IsActive)
        .Select(b => b.Tour)
        .Distinct()
        .Include(t => t.TourImages)
        .ToListAsync();
        }

        public async Task<Tour?> GetByIdAsync(Guid tourId)
        {
            return await _context.Tours
                                 .Include(t => t.TourImages)
                                 .Include(t => t.TourStops)
                                 .Include(t => t.TourInclusions)
                                 .Include(t => t.TourAddOns)
                                 .FirstOrDefaultAsync(t => t.Id == tourId && t.IsActive);
        }


        public async Task ReplaceTourRelationsAsync(
    Tour tour,
    List<TourStops> stops,
    List<TourInclusion> inclusions,
    List<TourAddOn> addons)
        {
            _context.TourStops.RemoveRange(tour.TourStops);
            _context.TourInclusions.RemoveRange(tour.TourInclusions);
            _context.TourAddOns.RemoveRange(tour.TourAddOns);

            await _context.TourStops.AddRangeAsync(stops);
            await _context.TourInclusions.AddRangeAsync(inclusions);
            await _context.TourAddOns.AddRangeAsync(addons);
            await _context.SaveChangesAsync();
        }

        public async Task ReplaceTourStopsAsync(
    Tour tour,
    List<TourStops> stops)
        {
            _context.TourStops.RemoveRange(tour.TourStops);

            await _context.TourStops.AddRangeAsync(stops);

            await _context.SaveChangesAsync();
        }

        public async Task ReplaceTourInclusionsAsync(
    Tour tour,
    List<TourInclusion> inclusions)
        {
            _context.TourInclusions.RemoveRange(
                tour.TourInclusions);

            await _context.TourInclusions
                .AddRangeAsync(inclusions);

            await _context.SaveChangesAsync();
        }

        public async Task ReplaceTourAddOnsAsync(
    Tour tour,
    List<TourAddOn> addons)
        {
            _context.TourAddOns.RemoveRange(
                tour.TourAddOns);

            await _context.TourAddOns
                .AddRangeAsync(addons);

            await _context.SaveChangesAsync();
        }








        public async Task ReplaceTourImagesAsync(Tour tour, List<TourImage> images)
        {
            _context.TourImages.RemoveRange(tour.TourImages);
            await _context.TourImages.AddRangeAsync(images);
            await _context.SaveChangesAsync();

        }

        public async Task UpdateAsync(Tour tour)
        {
            await _context.SaveChangesAsync();

        }


        public async Task DeleteAsync(Guid tourId)
        {
            var tour = await _context.Tours.FindAsync(tourId);

            if (tour == null)
                return;

            tour.IsActive = false;

            _context.Tours.Update(tour);
            await _context.SaveChangesAsync();
        }


        public async Task<bool> ExistsAsync(Guid tourId)
        {
            return await _context.Tours.AnyAsync(t => t.Id == tourId);
        }

        public async Task<List<Tour>> GetToursByPlaceAsync(int placeId)
        {
            return await _context.Tours
                .Include(t => t.TourImages)
                .Include(t => t.TourStops)
                    .ThenInclude(s => s.Place)
                .Where(t =>
                    t.IsActive &&
                    t.TourStops.Any(s => s.PlaceId == placeId))
                .ToListAsync();
        }
        public async Task<List<Tour>> GetAllActiveToursAsync()
        {
            return await _context.Tours
                .Include(t => t.TourImages)
                .Where(t => t.IsActive)
                .ToListAsync();
        }
    }
}