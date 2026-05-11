using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class GuideWalletDto
    {
        public Guid WalletId { get; set; }
        public string GuideId { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public bool IsFrozen { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}
