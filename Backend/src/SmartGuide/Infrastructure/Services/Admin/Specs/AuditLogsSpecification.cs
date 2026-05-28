using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Domain.Entities.Admin;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class AuditLogsSpecification
        : BaseSpecification<AdminAuditLog>
    {
        public AuditLogsSpecification(
            AuditLogSpecParams param)
        {
            Criteria = x =>

                (string.IsNullOrWhiteSpace(
                    param.AdminId)

                    ||

                    x.AdminId == param.AdminId)

                &&

                (string.IsNullOrWhiteSpace(
                    param.Action)

                    ||

                    x.Action.Contains(param.Action))

                &&

                (string.IsNullOrWhiteSpace(
                    param.EntityType)

                    ||

                    x.EntityType
                        == param.EntityType)

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
