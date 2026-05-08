using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface ITourAdminService
    {
        Task<List<AdminTourDto>> GetAllToursAsync();
        Task<OperationResultDto> DeactivateTourAsync(Guid tourId);
        Task<OperationResultDto> ActivateTourAsync(Guid tourId);
        Task<OperationResultDto> DeleteTourAsync(Guid tourId);
    }
}
