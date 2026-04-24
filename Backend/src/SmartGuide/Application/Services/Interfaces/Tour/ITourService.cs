using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Tour;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Tour
{
    public interface ITourService
    {
        public Task<List<TourListItemDto>> GetGuideToursAsync(string guideId);
        public Task<TourDetailsDto?> GetTourByIdAsync(Guid tourId);

        public Task<CreateTourResponseDTO> CreateTourAsync(CreateTourRequestDTO request, string guideId);
        Task<OperationResultDto> UpdateTourAsync(Guid id, CreateTourRequestDTO request, string guideId);
        Task<OperationResultDto> DeleteTourAsync(Guid id, string guideId);


    }
}
