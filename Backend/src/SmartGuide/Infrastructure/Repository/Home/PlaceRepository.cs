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
    public class PlaceRepository<T> : IPlaceRepository<T> where T : class
    {
        private readonly ApplicationDbContext _context;

        public PlaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<T>> GetAllWithSpecAsync(ISpecification<T> spec)
        {
            return await SpecificationEvaluator<T>
                .GetQuery(_context.Set<T>(), spec)
                .ToListAsync();
        }

        public async Task<int> CountAsync(ISpecification<T> spec)
        {
            return await _context.Set<T>()
                .Where(spec.Criteria)
                .CountAsync();
        }

        public async Task<T?> GetByIdAsync(int id)
        {
            return await _context.Set<T>().FindAsync(id);
        }
    }
}
