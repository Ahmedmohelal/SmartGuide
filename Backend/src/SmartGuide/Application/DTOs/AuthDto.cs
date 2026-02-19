using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs
{
    public class AuthDto
    {
        public string Message { get; set; }
        public bool IsAuthanticated { get; set; }
        public string UserName { get; set; }

        public string Email { get; set; }
        public string  Token { get; set; }

        public DateTime ExpiresOn { get; set; }
        public List<string> Roles { get; set; }




    }
}
