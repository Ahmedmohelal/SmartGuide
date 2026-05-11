using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class GuideWalletTransactionDto
    {
        public Guid Id { get; set; }
        public string GuideId { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal BalanceBefore { get; set; }
        public decimal BalanceAfter { get; set; }
        public string? ReferenceId { get; set; }
        public string? Notes { get; set; }
        public string AdminId { get; set; } = string.Empty;
        public DateTime CreatedAtUtc { get; set; }
    }
}

