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


        public async Task<Tour?> GetByIdAsync(Guid tourId)
        {
            return await _context.Tours
                                 .Include(t => t.TourImages)
                                 .Include(t => t.TourStops)
                                 .Include(t => t.TourInclusions)
                                 .Include(t => t.TourAddOns)
                                 .FirstOrDefaultAsync(t => t.Id == tourId && t.IsActive);
        }


        public Task ReplaceTourRelationsAsync(
    Tour tour,
    List<TourStops> stops,
    List<TourInclusion> inclusions,
    List<TourAddOn> addons)
        {
            // remove old
            //_context.TourStops.RemoveRange(tour.TourStops);
            //_context.TourInclusions.RemoveRange(tour.TourInclusions);
            //_context.TourAddOns.RemoveRange(tour.TourAddOns);
            //tour.TourStops.Clear();
            //tour.TourInclusions.Clear();
            //tour.TourAddOns.Clear();

            tour.TourStops = stops;
            tour.TourInclusions = inclusions;
            tour.TourAddOns = addons;

            //foreach (var s in stops)
            //    tour.TourStops.Add(s);

            //foreach (var i in inclusions)
            //    tour.TourInclusions.Add(i);

            //foreach (var a in addons)
            //    tour.TourAddOns.Add(a);

            return Task.CompletedTask;
        }
        public Task ReplaceTourImagesAsync(Tour tour, List<TourImage> images)
        {
            //tour.TourImages.Clear();
            //foreach (var img in images)
            //    tour.TourImages.Add(img);
            
                tour.TourImages = images;

            return Task.CompletedTask;

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


    }
}