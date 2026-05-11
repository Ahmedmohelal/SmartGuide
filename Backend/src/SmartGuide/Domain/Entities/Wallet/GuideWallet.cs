using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Wallet
{
    public class GuideWallet
    {
        public Guid Id { get; set; }
        public string GuideId { get; set; } = null!;
        public decimal Balance { get; set; }
        public bool IsFrozen { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    }
}
