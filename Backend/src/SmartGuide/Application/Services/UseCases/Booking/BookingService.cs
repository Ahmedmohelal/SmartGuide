using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Booking;
using Domain.Entities.Book;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepo;
    //private readonly IImageUrlService _imageUrlService;

    public BookingService(
        IBookingRepository bookingRepo)
    {
        _bookingRepo = bookingRepo;
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

        var slot = new BookingSlot
        {
            Id = Guid.NewGuid(),
            GuideId = guideId,
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

    public async Task<List<BookingSlotDto>> GetGuideSlotsByDateAsync(
        string guideId, DateOnly date)
    {
        var slots = await _bookingRepo
            .GetGuideSlotsByDateAsync(guideId, date);

        return slots.Select(s => new BookingSlotDto
        {
            Id = s.Id,
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
        var isAvailable = await _bookingRepo
            .IsSlotAvailableAsync(dto.SlotId);

        if (!isAvailable)
            return BookingResultDto.Failure(
                "This slot is full or no longer available.");

        var slot = await _bookingRepo.GetSlotByIdAsync(dto.SlotId);
        if (slot == null)
            return BookingResultDto.Failure("Slot not found.");

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TouristId = touristId,
            GuideId = slot.GuideId,
            TourId = dto.TourId,
            SlotId = dto.SlotId,
            Status = BookingStatus.Pending,
            TotalPrice = dto.TotalPrice,
            PaymentMethod = dto.PaymentMethod,
            CreatedAtUtc = DateTime.UtcNow
        };

        try
        {
            var created = await _bookingRepo
                .CreateBookingAsync(booking);

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

    public async Task<OperationResultDto> CancelBookingAsync(
        Guid bookingId, string requesterId)
    {
        var cancelled = await _bookingRepo
            .CancelBookingAsync(bookingId, requesterId);

        if (!cancelled)
            return new OperationResultDto
            {
                IsSuccess = false,
                Message = "Booking not found or already cancelled."
            };

        return new OperationResultDto
        {
            IsSuccess = true,
            Message = "Booking cancelled successfully."
        };
    }

    // ==================== Mapping ====================

    private BookingDto MapToDto(Booking b)
    {
        return new BookingDto
        {
            Id = b.Id,
            Status = b.Status.ToString(),
            TotalPrice = b.TotalPrice,
            PaymentMethod = b.PaymentMethod.ToString(),
            CreatedAtUtc = b.CreatedAtUtc,
            Slot = new BookingSlotInfoDto
            {
                Id = b.Slot.Id,
                Date = b.Slot.Date,
                StartTime = b.Slot.StartTime,
                EndTime = b.Slot.EndTime
            }
        };
    }
}