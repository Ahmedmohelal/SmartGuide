using Application.Common.Pagination;
using Application.Services.UseCases.Specifications;
using Domain.Entities.Wallet;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Admin.Specs
{
    public class WalletTransactionsCountSpecification
       : BaseSpecification<GuideWalletTransaction>
    {
        public WalletTransactionsCountSpecification(
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
        }
    }
}
