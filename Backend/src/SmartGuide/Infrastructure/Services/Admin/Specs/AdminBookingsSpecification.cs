using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Domain.Entities.Book;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class AdminBookingsSpecification
       : BaseSpecification<Booking>
    {
        public AdminBookingsSpecification(AdminBookingSpecParams param)
        {
            Criteria = x =>

                (string.IsNullOrWhiteSpace(
                    param.Status)

                    ||

                    x.Status.ToString()
                        == param.Status)

                &&

                (string.IsNullOrWhiteSpace(
                    param.GuideId)

                    ||

                    x.GuideId == param.GuideId)

                &&

                (string.IsNullOrWhiteSpace(
                    param.TouristId)

                    ||

                    x.TouristId == param.TouristId)

                &&

                (!param.FromDate.HasValue

                    ||

                    x.CreatedAtUtc
                        >= param.FromDate)

                &&

                (!param.ToDate.HasValue

                    ||

                    x.CreatedAtUtc
                        <= param.ToDate);

            ApplyPaging(
                param.PageSize
                * (param.PageIndex - 1),

                param.PageSize);

            OrderByDesc = x => x.CreatedAtUtc;
        }
    }

}
