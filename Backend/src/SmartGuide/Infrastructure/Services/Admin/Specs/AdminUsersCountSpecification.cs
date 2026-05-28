using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Infrastructure.Data.Entities.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class AdminUsersCountSpecification
    : BaseSpecification<ApplicationUser>
    {
        public AdminUsersCountSpecification(
            AdminUserSpecParams param)
        {
            if (!string.IsNullOrWhiteSpace(param.Search))
            {
                Criteria = x =>
                    x.UserName.Contains(param.Search);
            }
        }
    }
}
