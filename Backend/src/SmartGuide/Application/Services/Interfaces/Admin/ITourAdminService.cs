using Application.Common.Pagination;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Admin
{
    public interface ITourAdminService
    {
        Task<Pagination<AdminTourDto>> GetAllToursAsync(AdminTourSpecParams param);
        Task<OperationResultDto> DeactivateTourAsync(Guid tourId);
        Task<OperationResultDto> ActivateTourAsync(Guid tourId);
        Task<OperationResultDto> DeleteTourAsync(Guid tourId);
    }
}
