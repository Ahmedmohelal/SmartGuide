using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.AdminDashboard
{
    public class AdminUserDto
    {
        public string Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string UserName { get; set; }
        public string Country { get; set; }
        public string Role { get; set; }
        public string? WhatsAppNumber { get; set; }
        public string? ProfileImage { get; set; }
        public string? GuideLicenseImage { get; set; }
        public string? NationalIdImage { get; set; }
        public string VerificationStatus { get; set; }
        public bool IsActive { get; set; }
    }
}
