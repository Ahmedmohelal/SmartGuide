using Application.DTOs.Home;

using Application.Services.Interfaces.Home;
using Domain.Entities.Home;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services.Home;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Repository.Home
{
    public class PlaceRepository : IPlaceRepository<Place> 
    {
        private readonly ApplicationDbContext _context;

        public PlaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Place>> GetAllWithSpecAsync(ISpecification<Place > spec)
        {
            return await SpecificationEvaluator<Place>
                .GetQuery(_context.Set<Place>().Include(X=>X.Ratings), spec)
                .ToListAsync();
        }

        public async Task<int> CountAsync(ISpecification<Place> spec)
        {
            return await _context.Set<Place>()
                .Where(spec.Criteria)
                .CountAsync();
        }

        public async Task<Place?> GetByIdAsync(int id)
        {
            return await _context.Places.Include(X=>X.Ratings).FirstOrDefaultAsync(X=>X.Id == id);
        }
    }
}
