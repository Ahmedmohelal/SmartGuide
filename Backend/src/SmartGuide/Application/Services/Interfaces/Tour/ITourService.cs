using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Tour;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Tour
{
    public interface ITourService
    {
        Task<List<TourListItemDto>> GetGuideToursAsync(string guideId);
        Task<TourDetailsDto?> GetTourByIdAsync(Guid tourId);

        Task<CreateTourResponseDTO> CreateTourAsync(CreateTourRequestDTO request, string guideId);
        Task<OperationResultDto> UpdateTourAsync(Guid id, CreateTourRequestDTO request, string guideId);
        Task<OperationResultDto> DeleteTourAsync(Guid id, string guideId);

        Task<List<TourCardDto>> GetToursByPlaceAsync(int placeId);


    }
}
