using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Domain.Entities.Wallet;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class WalletTransactionsSpecification
       : BaseSpecification<GuideWalletTransaction>
    {
        public WalletTransactionsSpecification(
            string guideId,
            WalletTransactionSpecParams param)
        {
            Criteria = x =>

                x.GuideId == guideId

                &&

                (string.IsNullOrWhiteSpace(
                    param.TransactionType)

                    ||

                    x.Type.ToString()
                        == param.TransactionType);

            OrderByDesc = x => x.CreatedAtUtc;

            ApplyPaging(
                param.PageSize
                * (param.PageIndex - 1),

                param.PageSize);
        }
    }

}
