using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Booking;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Booking;
using Application.Services.Interfaces.Notifications;
using Domain.Entities.Book;
using Domain.Entities.Notifications;
using Domain.Entities.Tours;
using Domain.Interfaces;
using BookingEntity = Domain.Entities.Book.Booking;

namespace Application.Services.UseCases.Booking
{
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly ITourRepository _tourRepo;
        private readonly INotificationService _notificationService;
        private readonly IAdminAuditService _auditService;

        public BookingService(
            IBookingRepository bookingRepo,
            ITourRepository tourRepo,
            INotificationService notificationService,
            IAdminAuditService auditService)
        {
            _bookingRepo = bookingRepo;
            _tourRepo = tourRepo;
            _notificationService = notificationService;
            _auditService = auditService;
        }

        // ==================== Slots ====================

        public async Task<OperationResultDto> AddSlotAsync(
            string guideId, CreateBookingSlotDto dto)
        {
            if (dto.Date < DateOnly.FromDateTime(DateTime.UtcNow))
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Date must be in the future."
                };

            if (dto.EndTime <= dto.StartTime)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "End time must be after start time."
                };

            var tour = await _tourRepo.GetByIdAsync(dto.TourId);
            if (tour == null)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tour not found."
                };

            if (tour.GuideId != guideId)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Tour does not belong to this guide."
                };

            var ExistedSlots = await _bookingRepo.GetSlotsByTourAndDateAsync(dto.TourId, dto.Date);
            if (ExistedSlots.Any(s => (s.StartTime == dto.StartTime && s.EndTime == dto.EndTime)))
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "This Already Slot With This Tour."
                };
            }

            var slot = new BookingSlot
            {
                Id = Guid.NewGuid(),
                GuideId = guideId,
                TourId = dto.TourId,
                Date = dto.Date,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Capacity = dto.Capacity,
                BookedCount = 0
            };

            await _bookingRepo.AddSlotAsync(slot);

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Slot added successfully."
            };
        }


        public async Task<List<BookingSlotDto>> GetSlotsByTourAndDateAsync(
            Guid tourId, DateOnly date)
        {
            var slots = await _bookingRepo.GetSlotsByTourAndDateAsync(tourId, date);

            return slots.Select(s => new BookingSlotDto
            {
                Id = s.Id,
                TourId = s.TourId,
                Date = s.Date,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                Capacity = s.Capacity,
                BookedCount = s.BookedCount,
                IsFull = s.BookedCount >= s.Capacity
            }).ToList();
        }

        // ==================== Bookings ====================

        public async Task<BookingResultDto> CreateBookingAsync(
            string touristId, CreateBookingDto dto)
        {
            var slot = await _bookingRepo.GetSlotByIdAsync(dto.SlotId);
            if (slot == null)
                return BookingResultDto.Failure("Slot not found.");

            var slotDateTimeUtc = slot.Date.ToDateTime(slot.StartTime);

            if (slotDateTimeUtc <= DateTime.UtcNow)
            {
                return BookingResultDto.Failure(
                    "This tour slot has already passed.");
            }

            if (slot.TourId != dto.TourId)
                return BookingResultDto.Failure("Slot does not belong to this tour.");

            var isAvailable = await _bookingRepo.IsSlotAvailableAsync(dto.SlotId);
            if (!isAvailable)
                return BookingResultDto.Failure("This slot is full or no longer available.");

            var tour = await _tourRepo.GetByIdAsync(dto.TourId);
            if (tour == null)
                return BookingResultDto.Failure("Tour not found.");

            decimal totalPrice = tour.Price;
            var selectedAddOns = new List<BookingAddOn>();

            if (dto.SelectedAddOnIds != null && dto.SelectedAddOnIds.Count != 0)
            {
                var addOns = tour.TourAddOns
                    .Where(a => dto.SelectedAddOnIds.Contains(a.Id) && a.IsActive)
                    .ToList();

                foreach (var addOn in addOns)
                {
                    totalPrice += addOn.Price;
                    selectedAddOns.Add(new BookingAddOn
                    {
                        Id = Guid.NewGuid(),
                        TourAddOnId = addOn.Id,
                        Price = addOn.Price
                    });
                }
            }


            var booking = new BookingEntity
            {
                Id = Guid.NewGuid(),
                TouristId = touristId,
                GuideId = slot.GuideId,
                TourId = dto.TourId,
                SlotId = dto.SlotId,
                Status = BookingStatus.Pending,
                TotalPrice = totalPrice,
                PaymentMethod = dto.PaymentMethod,
                CreatedAtUtc = DateTime.UtcNow,
                SelectedAddOns = selectedAddOns
            };

            try
            {
                var created = await _bookingRepo.CreateBookingAsync(booking);
                await _notificationService.SendToMultipleAsync(
                    new[] { touristId, slot.GuideId },
                    "New Booking 🔔",
                    "A new booking has been created.",
                    NotificationType.BookingCreated,
                    created.Id.ToString(), "Booking");
                return BookingResultDto.Success(created.Id);
            }
            catch (InvalidOperationException ex)
            {
                return BookingResultDto.Failure(ex.Message);
            }
        }

        public async Task<List<BookingDto>> GetTouristBookingsAsync(
            string touristId)
        {
            var bookings = await _bookingRepo
                .GetTouristBookingsAsync(touristId);

            return bookings.Select(MapToDto).ToList();
        }

        public async Task<List<BookingDto>> GetGuideBookingsAsync(
            string guideId)
        {
            var bookings = await _bookingRepo
                .GetGuideBookingsAsync(guideId);

            return bookings.Select(MapToDto).ToList();
        }


        public async Task<OperationResultDto>
    ConfirmBookingAsync(
        Guid bookingId,
        string guideId)
        {
            var booking =
                await _bookingRepo
                    .GetBookingByIdAsync(
                        bookingId);

            if (booking == null)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking not found."
                };
            }

            if (booking.GuideId != guideId)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Unauthorized."
                };
            }

            if (booking.Status == BookingStatus.Cancelled)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking is cancelled."
                };
            }

            if (booking.Status == BookingStatus.Confirmed)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking already confirmed."
                };
            }

            if (booking.PaymentMethod != PaymentMethod.Cash)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Only cash bookings can be confirmed manually."
                };
            }


            await _bookingRepo.ConfirmCashBookingAsync(bookingId, guideId);


            await _bookingRepo.UpdateAsync(booking);

            await _notificationService.SendToMultipleAsync(
                new[] { booking.TouristId, booking.GuideId },
                "Booking Confirmed ✅",
                "Your cash booking has been confirmed.",
                NotificationType.BookingConfirmed,
                booking.Id.ToString(),
                "Booking");


            await _auditService.WriteAsync(guideId, "ConfirmBooking", "Booking", booking.Id.ToString(), "Unknown", "Unknown");



            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Booking confirmed successfully."
            };
        }





        public async Task<OperationResultDto> CancelBookingAsync(
            Guid bookingId, string requesterId)
        {
            var booking = await _bookingRepo.GetBookingByIdAsync(bookingId);

            if (booking == null)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking not found."
                };
            if (booking.Status == BookingStatus.Cancelled)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking is already cancelled."
                };

            // if (booking.TouristId != requesterId && booking.GuideId != requesterId)
            //{
            //    return new OperationResultDto
            //    {
            //        IsSuccess = false,
            //        Message = "Unauthorized."
            //    };
            //}

            var cancelled = await _bookingRepo
                .CancelBookingAsync(bookingId, requesterId);

            if (!cancelled.Success)
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Booking not found or already cancelled."
                };


            await _notificationService.SendToMultipleAsync(
                new[] { booking.TouristId, booking.GuideId },
                "Booking Cancelled ❌",
                "A booking has been cancelled.",
                NotificationType.BookingCancelled,
                bookingId.ToString(), "Booking");


            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Booking cancelled successfully."
            };
        }

        // ==================== Mapping ====================

        private static BookingDto MapToDto(BookingEntity b)
        {
            return new BookingDto
            {
                Id = b.Id,
                Status = b.Status.ToString(),
                TotalPrice = b.TotalPrice,
                PaymentMethod = b.PaymentMethod.ToString(),
                CreatedAtUtc = b.CreatedAtUtc,
                ConfirmedAtUtc = b.ConfirmedAtUtc,
                Slot = new BookingSlotInfoDto
                {
                    Id = b.Slot.Id,
                    Date = b.Slot.Date,
                    StartTime = b.Slot.StartTime,
                    EndTime = b.Slot.EndTime
                },
                SelectedAddOns = b.SelectedAddOns
                    .Select(a => new BookingAddOnDto
                    {
                        TourAddOnId = a.TourAddOnId,
                        Title = a.TourAddOn?.Title ?? string.Empty,
                        Price = a.Price
                    })
                    .ToList()
            };
        }
    }
}