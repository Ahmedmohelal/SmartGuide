using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Infrastructure.Data.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class AdminGuidesSpecification
        : BaseSpecification<ApplicationUser>
    {
        public AdminGuidesSpecification(
            AdminGuideSpecParams param)
        {
            Criteria = x =>

                x.Role == "TourGuide"

                &&

                (string.IsNullOrWhiteSpace(
                    param.Search)

                    ||

                    x.UserName.Contains(param.Search)

                    ||

                    x.Email.Contains(param.Search))

                &&

                (string.IsNullOrWhiteSpace(
                    param.Country)

                    ||

                    x.Country == param.Country)

                &&

                (string.IsNullOrWhiteSpace(
                    param.VerificationStatus)

                    ||

                    x.IsGuideVerified.ToString()
                        == param.VerificationStatus)

                 &&

                (string.IsNullOrWhiteSpace(
                    param.VerificationStatus)
                
                 ||
                
                 x.IsGuideVerified.ToString()
                    == param.VerificationStatus);

            ApplyPaging(
                param.PageSize
                * (param.PageIndex - 1),

                param.PageSize);
        }
    }
}
