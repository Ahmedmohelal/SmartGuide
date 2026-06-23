using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface IBookingAdminService
    {
        Task<Pagination<AdminBookingDto>> GetAllBookingsAsync(AdminBookingSpecParams param);
        Task<bool> CancelBookingAsync(Guid bookingId, string requesterId);
    }
}
