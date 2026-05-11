using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Wallet
{
    public enum WalletTransactionStatus
    {
        Pending = 0,
        Completed = 1,
        Rejected = 2
    }
}
