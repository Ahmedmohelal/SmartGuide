using Domain.Entities.Tours;
using Domain.Interfaces;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repository.Tours
{
    public class TourRepository : ITourRepository
    {
        private readonly ApplicationDbContext _context;
        public TourRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<List<Tour>> GetGuideToursAsync(string guideId)
        {
            return await _context.Tours
                .Where(t => t.GuideId == guideId && t.IsActive)
                .Include(t => t.TourImages)
                .ToListAsync();
        }

       
    }
}
