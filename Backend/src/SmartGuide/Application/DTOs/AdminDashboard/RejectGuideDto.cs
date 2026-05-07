using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class RejectGuideDto
    {
        [Required]
        public string Reason { get; set; } = string.Empty;
    }
}
