using Application.DTOs.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Home
{
    public interface IPlaceService
    {
        public Task<Pagination<PlaceCardDto>> GetPlaces(PlaceSpecParams param);
        Task<PlaceDetailsDto?> GetById(int id);

    }
}
