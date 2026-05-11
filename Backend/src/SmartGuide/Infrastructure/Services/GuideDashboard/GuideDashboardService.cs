using Application.DTOs.AdminDashboard;
using Application.DTOs.GuideDashboard;
using Application.Services.Interfaces.GuideDashboard;
using Domain.Entities.Book;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.GuideDashboard
{
    public class GuideDashboardService : IGuideDashboardService
    {
        private readonly ApplicationDbContext _context;

        public GuideDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GuideDashboardResponseDto> GetDashboardAsync(
            string guideId,
            int months = 6,
            int topTours = 5)
        {
            months = Math.Clamp(months, 1, 24);
            topTours = Math.Clamp(topTours, 1, 20);

            var statistics =
                await GetStatisticsAsync(guideId);

            var earnings =
                await GetEarningsTimelineAsync(
                    guideId,
                    months);

            var bookings =
                await GetBookingsTimelineAsync(
                    guideId,
                    months);

            var popular =
                await GetTourPerformanceAsync(
                    guideId,
                    topTours,
                    mostPopular: true);

            var least =
                await GetTourPerformanceAsync(
                    guideId,
                    topTours,
                    mostPopular: false);

            var activities =
                await GetRecentActivitiesAsync(
                    guideId,
                    20);

            return new GuideDashboardResponseDto
            {
                Statistics = statistics,
                MonthlyEarnings = earnings,
                MonthlyBookings = bookings,
                MostPopularTours = popular,
                LeastActiveTours = least,
                RecentActivities = activities
            };
        }

        public async Task<GuideDashboardStatisticsDto> GetStatisticsAsync(
            string guideId)
        {
            var now = DateTime.UtcNow;

            var monthStart =
                new DateTime(now.Year, now.Month, 1);

            var user = await _context.Users
                .AsNoTracking()
                .Where(u => u.Id == guideId)
                .Select(u => new
                {
                    u.IsGuideVerified,
                    u.GuideAccountStatus
                })
                .FirstOrDefaultAsync();

            var tours = await _context.Tours
                .AsNoTracking()
                .Where(t => t.GuideId == guideId)
                .Select(t => new
                {
                    t.Id,
                    t.IsActive
                })
                .ToListAsync();

            var bookings = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.GuideId == guideId)
                .Include(b => b.Slot)
                .Select(b => new
                {
                    b.TourId,
                    b.TouristId,
                    b.Status,
                    b.TotalPrice,
                    b.CreatedAtUtc,
                    SlotDate = b.Slot.Date,
                    SlotStart = b.Slot.StartTime
                })
                .ToListAsync();

            var wallet = await _context.GuideWallets
                .AsNoTracking()
                .Where(w => w.GuideId == guideId)
                .Select(w => new
                {
                    w.Balance
                })
                .FirstOrDefaultAsync();

            var activeTours =
                tours.Count(x => x.IsActive);

            var inactiveTours =
                tours.Count - activeTours;

            var totalTours =
                tours.Count;

            var upcomingTours = bookings.Count(
                b => b.Status != BookingStatus.Cancelled &&
                     b.SlotDate.ToDateTime(b.SlotStart) > now);

            var cancelledTours = bookings.Count(
                b => b.Status == BookingStatus.Cancelled);

            var completedTours = bookings.Count(
                b => b.Status == BookingStatus.Confirmed &&
                     b.SlotDate.ToDateTime(b.SlotStart) <= now);

            var confirmed = bookings
                .Where(b => b.Status == BookingStatus.Confirmed)
                .ToList();

            var totalEarnings =
                confirmed.Sum(x => x.TotalPrice);

            var pendingEarnings = bookings
                .Where(b => b.Status == BookingStatus.Pending)
                .Sum(x => x.TotalPrice);

            var monthlyRevenue = confirmed
                .Where(x => x.CreatedAtUtc >= monthStart)
                .Sum(x => x.TotalPrice);

            return new GuideDashboardStatisticsDto
            {
                WalletBalance = wallet?.Balance ?? 0m,
                TotalEarnings = totalEarnings,
                PendingEarnings = pendingEarnings,
                TotalTours = totalTours,
                ActiveTours = activeTours,
                InactiveTours = inactiveTours,
                UpcomingTours = upcomingTours,
                CancelledTours = cancelledTours,
                CompletedTours = completedTours,
                TotalTouristsServed = confirmed.Count,
                TotalUniqueTourists = confirmed
                    .Select(x => x.TouristId)
                    .Distinct()
                    .Count(),
                MonthlyRevenue = monthlyRevenue,
                PendingWithdrawals = 0,
                VerificationStatus =
                    user?.IsGuideVerified.ToString()
                    ?? "Unknown",
                AccountStatus =
                    user?.GuideAccountStatus.ToString()
                    ?? "Unknown",
                AverageRating = 0,
                TotalReviews = 0,
                ReviewsDataAvailable = false
            };
        }

        public async Task<List<GuideMonthlyEarningsPointDto>>
            GetEarningsTimelineAsync(
                string guideId,
                int months = 12)
        {
            months = Math.Clamp(months, 1, 36);

            var from =
                DateTime.UtcNow.AddMonths(-(months - 1));

            var fromMonth =
                new DateTime(from.Year, from.Month, 1);

            return await _context.Bookings
                .AsNoTracking()
                .Where(b =>
                    b.GuideId == guideId &&
                    b.Status == BookingStatus.Confirmed &&
                    b.CreatedAtUtc >= fromMonth)
                .GroupBy(b => new
                {
                    b.CreatedAtUtc.Year,
                    b.CreatedAtUtc.Month
                })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .Select(g => new GuideMonthlyEarningsPointDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Earnings = g.Sum(x => x.TotalPrice)
                })
                .ToListAsync();
        }

        public async Task<List<GuideMonthlyBookingsPointDto>>
            GetBookingsTimelineAsync(
                string guideId,
                int months = 12)
        {
            months = Math.Clamp(months, 1, 36);

            var from =
                DateTime.UtcNow.AddMonths(-(months - 1));

            var fromMonth =
                new DateTime(from.Year, from.Month, 1);

            return await _context.Bookings
                .AsNoTracking()
                .Where(b =>
                    b.GuideId == guideId &&
                    b.CreatedAtUtc >= fromMonth)
                .GroupBy(b => new
                {
                    b.CreatedAtUtc.Year,
                    b.CreatedAtUtc.Month
                })
                .OrderBy(g => g.Key.Year)
                .ThenBy(g => g.Key.Month)
                .Select(g => new GuideMonthlyBookingsPointDto
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalBookings = g.Count(),
                    ConfirmedBookings = g.Count(
                        x => x.Status == BookingStatus.Confirmed),
                    CancelledBookings = g.Count(
                        x => x.Status == BookingStatus.Cancelled)
                })
                .ToListAsync();
        }

        public async Task<List<GuideTourPerformanceDto>>
            GetTourPerformanceAsync(
                string guideId,
                int take = 10,
                bool mostPopular = true)
        {
            take = Math.Clamp(take, 1, 50);

            var tourBase = _context.Tours
                .AsNoTracking()
                .Where(t => t.GuideId == guideId)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.MaxGroupSize
                });

            var bookingAgg = _context.Bookings
                .AsNoTracking()
                .Where(b => b.GuideId == guideId)
                .GroupBy(b => b.TourId)
                .Select(g => new
                {
                    TourId = g.Key,
                    TotalBookings = g.Count(),
                    ConfirmedBookings = g.Count(
                        x => x.Status == BookingStatus.Confirmed),
                    CancelledBookings = g.Count(
                        x => x.Status == BookingStatus.Cancelled),
                    Revenue = g.Where(
                        x => x.Status == BookingStatus.Confirmed)
                        .Sum(x => x.TotalPrice)
                });

            var slotAgg = _context.BookingsSlot
                .AsNoTracking()
                .Where(s => s.GuideId == guideId)
                .GroupBy(s => s.TourId)
                .Select(g => new
                {
                    TourId = g.Key,
                    TotalCapacity = g.Sum(x => x.Capacity),
                    TotalBooked = g.Sum(x => x.BookedCount)
                });

            var rows = await (
                from t in tourBase
                join b in bookingAgg
                    on t.Id equals b.TourId into bjoin
                from b in bjoin.DefaultIfEmpty()

                join s in slotAgg
                    on t.Id equals s.TourId into sjoin
                from s in sjoin.DefaultIfEmpty()

                select new GuideTourPerformanceDto
                {
                    TourId = t.Id,
                    Title = t.Title,
                    TotalBookings =
                        b == null ? 0 : b.TotalBookings,
                    ConfirmedBookings =
                        b == null ? 0 : b.ConfirmedBookings,
                    CancelledBookings =
                        b == null ? 0 : b.CancelledBookings,
                    Revenue =
                        b == null ? 0m : b.Revenue,
                    OccupancyRate =
                        s == null || s.TotalCapacity == 0
                            ? 0d
                            : (double)s.TotalBooked /
                              s.TotalCapacity
                }).ToListAsync();

            return mostPopular
                ? rows.OrderByDescending(x => x.TotalBookings)
                    .ThenByDescending(x => x.Revenue)
                    .Take(take)
                    .ToList()
                : rows.OrderBy(x => x.TotalBookings)
                    .ThenBy(x => x.Revenue)
                    .Take(take)
                    .ToList();
        }

        public async Task<GuideWalletDto> GetWalletAsync(
            string guideId)
        {
            var wallet = await _context.GuideWallets
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.GuideId == guideId);

            return new GuideWalletDto
            {
                WalletId = wallet?.Id ?? Guid.Empty,
                GuideId = guideId,
                Balance = wallet?.Balance ?? 0m,
                IsFrozen = wallet?.IsFrozen ?? false,
                UpdatedAtUtc =
                    wallet?.UpdatedAtUtc ?? DateTime.UtcNow
            };
        }

        public async Task<List<GuideWalletTransactionDto>>
            GetWalletTransactionsAsync(
                string guideId,
                int take = 100)
        {
            take = Math.Clamp(take, 1, 500);

            return await _context.GuideWalletTransactions
                .AsNoTracking()
                .Where(x => x.GuideId == guideId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .Take(take)
                .Select(x => new GuideWalletTransactionDto
                {
                    Id = x.Id,
                    GuideId = x.GuideId,
                    Type = x.Type.ToString(),
                    Status = x.Status.ToString(),
                    Amount = x.Amount,
                    BalanceBefore = x.BalanceBefore,
                    BalanceAfter = x.BalanceAfter,
                    ReferenceId = x.ReferenceId,
                    Notes = x.Notes,
                    AdminId = x.AdminId,
                    CreatedAtUtc = x.CreatedAtUtc
                })
                .ToListAsync();
        }

        public async Task<List<GuideRecentActivityDto>>
            GetRecentActivitiesAsync(
                string guideId,
                int take = 20)
        {
            take = Math.Clamp(take, 1, 100);

            var bookingActivities = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.GuideId == guideId)
                .OrderByDescending(b => b.CreatedAtUtc)
                .Take(take)
                .Select(b => new GuideRecentActivityDto
                {
                    OccurredAtUtc = b.CreatedAtUtc,
                    Type = "Booking",
                    Title = $"Booking {b.Status}",
                    Description =
                        $"TourId: {b.TourId} - Amount: {b.TotalPrice}"
                })
                .ToListAsync();

            var walletActivities =
                await _context.GuideWalletTransactions
                .AsNoTracking()
                .Where(t => t.GuideId == guideId)
                .OrderByDescending(t => t.CreatedAtUtc)
                .Take(take)
                .Select(t => new GuideRecentActivityDto
                {
                    OccurredAtUtc = t.CreatedAtUtc,
                    Type = "Wallet",
                    Title = $"{t.Type} {t.Status}",
                    Description = t.Notes
                })
                .ToListAsync();

            return bookingActivities
                .Concat(walletActivities)
                .OrderByDescending(x => x.OccurredAtUtc)
                .Take(take)
                .ToList();
        }
    }
}