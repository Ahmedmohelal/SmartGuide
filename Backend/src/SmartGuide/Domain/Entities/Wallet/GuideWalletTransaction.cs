using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Wallet
{
    public class GuideWalletTransaction
    {
        public Guid Id { get; set; }
        public Guid WalletId { get; set; }
        public string GuideId { get; set; } = null!;
        public WalletTransactionType Type { get; set; }
        public WalletTransactionStatus Status { get; set; } = WalletTransactionStatus.Completed;
        public decimal Amount { get; set; }
        public decimal BalanceBefore { get; set; }
        public decimal BalanceAfter { get; set; }
        public string? ReferenceId { get; set; }
        public string? Notes { get; set; }
        public string AdminId { get; set; } = null!;
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}
