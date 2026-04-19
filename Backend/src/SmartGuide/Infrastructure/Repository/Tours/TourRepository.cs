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
            // EF Core saves the full aggregate graph through navigation properties.
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
                .FirstOrDefaultAsync(t => t.Id == tourId);
        }

     
        public async Task UpdateAsync(Tour tour)
        {
            _context.Tours.Update(tour);
            await _context.SaveChangesAsync();
        }


        public async Task DeleteAsync(Guid tourId)
        {
            var tour = await _context.Tours.FindAsync(tourId);

            if (tour == null)
                throw new Exception("Tour not found");

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