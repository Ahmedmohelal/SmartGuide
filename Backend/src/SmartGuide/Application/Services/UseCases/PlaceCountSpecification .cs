using Application.DTOs.Home;
using Domain.Entities.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases
{
    public class PlaceCountSpecification : BaseSpecification<Place>
    {
        public PlaceCountSpecification(PlaceSpecParams p)
        {
            Criteria = x =>
                (string.IsNullOrEmpty(p.Search) || x.Name.ToLower().Contains(p.Search)) &&
                (string.IsNullOrEmpty(p.City) || x.City == p.City) &&
                (!p.MinRating.HasValue || x.Rating >= p.MinRating);
        }
    }
}
