using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Domain.Entities.Tours;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class AdminToursSpecification
       : BaseSpecification<Tour>
    {
        public AdminToursSpecification(
            AdminTourSpecParams param)
        {
            Criteria = x =>

                (string.IsNullOrWhiteSpace(
                    param.Search)

                    ||

                    x.Title.Contains(param.Search))

                &&

                (string.IsNullOrWhiteSpace(
                    param.GuideId)

                    ||

                    x.GuideId == param.GuideId)

                &&

                (!param.IsActive.HasValue

                    ||

                    x.IsActive == param.IsActive)

                &&

                (!param.MinPrice.HasValue

                    ||

                    x.Price >= param.MinPrice)

                &&

                (!param.MaxPrice.HasValue

                    ||

                    x.Price <= param.MaxPrice);

            ApplyPaging(
                param.PageSize
                * (param.PageIndex - 1),

                param.PageSize);
            OrderByDesc = x => x.Id;
        }
    }

}
