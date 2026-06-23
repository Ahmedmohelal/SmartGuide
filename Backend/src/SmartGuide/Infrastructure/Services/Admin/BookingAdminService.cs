using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.Home;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Notifications;
using Domain.Entities.Book;
using Domain.Entities.Notifications;
using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Services.Admin.Specs;
using Infrastructure.Services.Home;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Admin
{
    public class BookingAdminService : IBookingAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IBookingRepository _bookingRepository;
        private readonly INotificationService _notificationService;

        public BookingAdminService(
            ApplicationDbContext context,
            IBookingRepository bookingRepository,
            INotificationService notificationService)
        {
            _context = context;
            _bookingRepository = bookingRepository;
            _notificationService = notificationService;
        }

        public async Task<Pagination<AdminBookingDto>>
            GetAllBookingsAsync(AdminBookingSpecParams param)
        {
            var spec =
                new AdminBookingsSpecification(
                    param);

            var countSpec =
                new AdminBookingsCountSpecification(
                    param);

            var bookingsQuery =
                SpecificationEvaluator<Booking>
                    .GetQuery(
                        _context.Bookings
                            .Include(b => b.Slot)
                            .AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<Booking>
                    .GetQuery(
                        _context.Bookings.AsQueryable(),
                        countSpec);

            var bookings = await bookingsQuery

                .AsNoTracking()

                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var userIds = bookings

                .Select(b => b.TouristId)

                .Concat(
                    bookings.Select(b => b.GuideId))

                .Distinct()

                .ToList();

            var users = await _context.Users

                .AsNoTracking()

                .Where(u => userIds.Contains(u.Id))

                .ToDictionaryAsync(u => u.Id);

            var tourIds = bookings

                .Select(b => b.TourId)

                .Distinct()

                .ToList();

            var tours = await _context.Tours

                .AsNoTracking()

                .Where(t => tourIds.Contains(t.Id))

                .ToDictionaryAsync(t => t.Id);

            var mappedBookings = bookings
                .Select(b =>
                {
                    users.TryGetValue(
                        b.TouristId,
                        out var tourist);

                    users.TryGetValue(
                        b.GuideId,
                        out var guide);

                    tours.TryGetValue(
                        b.TourId,
                        out var tour);

                    return new AdminBookingDto
                    {
                        Id = b.Id,

                        TouristId = b.TouristId,

                        TouristName = tourist != null
                            ? $"{tourist.FirstName} {tourist.LastName}"
                            : "Unknown",

                        TouristEmail =
                            tourist?.Email
                            ?? string.Empty,

                        GuideId = b.GuideId,

                        GuideName = guide != null
                            ? $"{guide.FirstName} {guide.LastName}"
                            : "Unknown",

                        TourId = b.TourId,

                        TourTitle =
                            tour?.Title
                            ?? "Unknown",

                        Status =
                            b.Status.ToString(),

                        TotalPrice =
                            b.TotalPrice,

                        PaymentMethod =
                            b.PaymentMethod.ToString(),

                        CreatedAtUtc =
                            b.CreatedAtUtc,

                        SlotDate =
                            b.Slot.Date,

                        SlotStartTime =
                            b.Slot.StartTime,

                        SlotEndTime =
                            b.Slot.EndTime
                    };

                }).ToList();

            return new Pagination<AdminBookingDto>(
                param.PageIndex,
                param.PageSize,
                count,
                mappedBookings);
        }

        public async Task<bool> CancelBookingAsync(Guid bookingId, string requesterId)
        {
            var cancelled = await _bookingRepository
                .CancelBookingAsync(bookingId, requesterId);

            if (!cancelled.Success)
                return false;

            var booking = await _bookingRepository.GetBookingByIdAsync(bookingId);
            if (booking is not null)
            {
                await _notificationService.SendToMultipleAsync(
                    new[] { booking.TouristId, booking.GuideId },
                    "Booking Cancelled by Admin ❌",
                    "Your booking has been cancelled by the administrator.",
                    NotificationType.BookingCancelled,
                    bookingId.ToString(),
                    "Booking");
            }

            return true;
        }
    }
}
