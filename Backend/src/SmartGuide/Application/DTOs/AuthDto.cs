using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public class AuthDto
    {
        public string Id { get; set; }
        public string Message { get; set; }
        public bool IsAuthanticated { get; set; }
        public string UserName { get; set; }

        public string Email { get; set; }
        public string Country { get; set; }
        public string Token { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime ExpiresOn { get; set; }
        public DateTime? RefreshTokenExpiresOn { get; set; }
        public List<string> Roles { get; set; } = new();
        public bool IsGuideVerified { get; set; } = false;

    }
}
