using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface IAuthService
    {
        public Task<AuthDto> RegisterAsync(RegisterDto model);
        public Task<AuthDto> GetTokenAsync(TokenRequestDto model);

        public  Task<string> AddRoleAsync(AddRoleDto model);



    }
}
