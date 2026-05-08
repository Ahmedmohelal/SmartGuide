using Application.DTOs.AdminDashboard;
using Application.Services.Interfaces.Admin;
using Domain.Entities.Book;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin
{
    public class AdminDashboardService: IAdminDashboardService  
    {

        private readonly ApplicationDbContext _context;

        public AdminDashboardService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminStatisticsDto> GetStatisticsAsync()
        {
            var totalUsers = await _context.Users.CountAsync();
            var totalTourists = await _context.Users
                .CountAsync(u => u.Role == "Tourist");
            var totalGuides = await _context.Users
                .CountAsync(u => u.Role == "TourGuide");
            var pendingVerifications = await _context.Users
                .CountAsync(u => u.IsGuideVerified == GuideVerificationStatus.Pending);
            var totalTours = await _context.Tours.CountAsync();
            var activeTours = await _context.Tours.CountAsync(t => t.IsActive);
            var totalBookings = await _context.Bookings.CountAsync();
            var pendingBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Pending);
            var confirmedBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Confirmed);
            var cancelledBookings = await _context.Bookings
                .CountAsync(b => b.Status == BookingStatus.Cancelled);
            var totalRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed)
                .SumAsync(b => b.TotalPrice);
            var onlineRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed &&
                            b.PaymentMethod == PaymentMethod.Online)
                .SumAsync(b => b.TotalPrice);
            var cashRevenue = await _context.Bookings
                .Where(b => b.Status == BookingStatus.Confirmed &&
                            b.PaymentMethod == PaymentMethod.Cash)
                .SumAsync(b => b.TotalPrice);

            return new AdminStatisticsDto
            {
                TotalUsers = totalUsers,
                TotalTourists = totalTourists,
                TotalTourGuides = totalGuides,
                PendingVerifications = pendingVerifications,
                TotalTours = totalTours,
                ActiveTours = activeTours,
                TotalBookings = totalBookings,
                PendingBookings = pendingBookings,
                ConfirmedBookings = confirmedBookings,
                CancelledBookings = cancelledBookings,
                TotalRevenue = totalRevenue,
                OnlineRevenue = onlineRevenue,
                CashRevenue = cashRevenue
            };
        }

        public async Task<AdminRevenueDto> GetRevenueAsync()
        {
            var confirmedBookings = await _context.Bookings
                .AsNoTracking()
                .Where(b => b.Status == BookingStatus.Confirmed)
                .ToListAsync();

            var totalRevenue = confirmedBookings.Sum(b => b.TotalPrice);
            var onlineRevenue = confirmedBookings
                .Where(b => b.PaymentMethod == PaymentMethod.Online)
                .Sum(b => b.TotalPrice);
            var cashRevenue = confirmedBookings
                .Where(b => b.PaymentMethod == PaymentMethod.Cash)
                .Sum(b => b.TotalPrice);

            var guideIds = confirmedBookings
                .Select(b => b.GuideId)
                .Distinct()
                .ToList();

            var guides = await _context.Users
                .AsNoTracking()
                .Where(u => guideIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

            var revenuePerGuide = confirmedBookings
                .GroupBy(b => b.GuideId)
                .Select(g =>
                {
                    guides.TryGetValue(g.Key, out var guide);
                    return new GuideRevenueDto
                    {
                        GuideId = g.Key,
                        GuideName = guide != null
                            ? $"{guide.FirstName} {guide.LastName}"
                            : "Unknown",
                        TotalRevenue = g.Sum(b => b.TotalPrice),
                        TotalBookings = g.Count()
                    };
                })
                .OrderByDescending(x => x.TotalRevenue)
                .ToList();

            return new AdminRevenueDto
            {
                TotalRevenue = totalRevenue,
                OnlineRevenue = onlineRevenue,
                CashRevenue = cashRevenue,
                RevenuePerGuide = revenuePerGuide
            };
        }
    }
}
