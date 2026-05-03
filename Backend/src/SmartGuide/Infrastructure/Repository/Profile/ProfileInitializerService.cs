using Application.Helper;
using Application.Services.Interfaces.Profiles;
using Domain.Entities.Profiles.TourGuide;
using Domain.Entities.Profiles.Tourist;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repository.Profile
{
    public class ProfileInitializerService : IProfileInitializerService
    {
        private readonly ApplicationDbContext _context;

        public ProfileInitializerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task EnsureProfileExistsAsync(string userId, string role, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(role))
                return;

            if (role.Equals(Roles.TourGuide, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _context.TourGuideProfiles
                    .AsNoTracking()
                    .AnyAsync(x => x.UserId == userId, cancellationToken);

                if (!exists)
                {
                    _context.TourGuideProfiles.Add(new TourGuideProfile
                    {
                        UserId = userId
                    });

                    await _context.SaveChangesAsync(cancellationToken);
                }

                return;
            }

            if (role.Equals(Roles.Tourist, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _context.TouristProfiles
                    .AsNoTracking()
                    .AnyAsync(x => x.UserId == userId, cancellationToken);

                if (!exists)
                {
                    _context.TouristProfiles.Add(new TouristProfile
                    {
                        Id = Guid.NewGuid(),
                        UserId = userId
                    });

                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }
    }
}
