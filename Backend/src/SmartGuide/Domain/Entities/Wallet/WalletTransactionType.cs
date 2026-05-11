using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Wallet
{
    public enum WalletTransactionType
    {
        Deposit = 0,
        Withdrawal = 1,
        Refund = 2,
        Penalty = 3,
        AdminAdjustment = 4
    }
}
