using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Booking
{
    public interface IBookingService
    {
        // Slots
        Task<OperationResultDto> AddSlotAsync(
            string guideId, CreateBookingSlotDto dto);

        Task<List<BookingSlotDto>> GetSlotsByTourAndDateAsync(
            Guid tourId, DateOnly date);

        // Bookings
        Task<BookingResultDto> CreateBookingAsync(
            string touristId, CreateBookingDto dto);

        Task<List<BookingDto>> GetTouristBookingsAsync(string touristId);

        Task<List<BookingDto>> GetGuideBookingsAsync(string guideId);

        Task<OperationResultDto> CancelBookingAsync(
            Guid bookingId, string requesterId);
    }
}
