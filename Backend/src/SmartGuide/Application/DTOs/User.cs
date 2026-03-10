using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public class User
    {
        public string Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string Email { get; set; }
        //public string Password { get; set; }

        public string UserName { get; set; }
        public string Country { get; set; }
        public string Role { get; set; }

        public string? GuideLicenseImage { get; set; }

        public string? NationalIdImage { get; set; }

        /// <summary>
        /// Optional WhatsApp number for contact (e.g. E.164 format).
        /// </summary>
        public string? WhatsAppNumber { get; set; }
    }
}
