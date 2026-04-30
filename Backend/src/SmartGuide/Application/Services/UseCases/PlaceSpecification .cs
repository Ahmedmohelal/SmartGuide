using Application.DTOs.Home;
using Domain.Entities.Home;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases
{
    public class PlaceSpecification : BaseSpecification<Place>
    {
        public PlaceSpecification(PlaceSpecParams p)
        {
            Criteria = x =>
            (string.IsNullOrEmpty(p.Search) || x.Name.ToLower().Contains(p.Search)) &&
            (string.IsNullOrEmpty(p.City) || x.City == p.City) &&
            (!p.MinRating.HasValue || x.Rating >= p.MinRating);

            // Sorting
            switch (p.Sort)
            {
                case "rating":
                    OrderByDesc = x => x.Rating;
                    break;
                case "name":
                    OrderBy = x => x.Name;
                    break;
                default:
                    OrderBy = x => x.Id;
                    break;
            }

            ApplyPaging((p.PageIndex - 1) * p.PageSize, p.PageSize);
        }
    }
}
