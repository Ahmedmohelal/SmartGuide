using Application.DTOs;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces
{
    public interface ITokenService
    {
        public Task<(string token, DateTime expires)> CreateTokenAsync(User user);


    }
}
