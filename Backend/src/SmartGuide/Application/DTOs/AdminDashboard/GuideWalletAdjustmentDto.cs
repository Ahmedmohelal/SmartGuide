using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class GuideWalletAdjustmentDto
    {
        [Range(typeof(decimal), "0.01", "999999999")]
        public decimal Amount { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }
    }
}
