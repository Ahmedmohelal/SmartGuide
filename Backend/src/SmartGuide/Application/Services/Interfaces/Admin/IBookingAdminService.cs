using Application.DTOs.AdminDashboard;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IBookingAdminService
    {
        Task<List<AdminBookingDto>> GetAllBookingsAsync(string? status = null, string? guideId = null);
        Task<bool> CancelBookingAsync(Guid bookingId, string requesterId);
    }
}
