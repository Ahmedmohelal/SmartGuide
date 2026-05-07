using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Home
{
    public interface IPlaceService
    {
        Task<Pagination<PlaceCardDto>> GetPlaces(PlaceSpecParams param,string? touristUserId);
        Task<PlaceDetailsDto?> GetById(int id);

    }
}
