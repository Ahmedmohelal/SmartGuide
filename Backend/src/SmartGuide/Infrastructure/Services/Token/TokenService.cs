using Application.DTOs;
using Application.Services.Interfaces;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Services.Token
{
    public class TokenService : ITokenService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly JWT _JWT;

        public TokenService(UserManager<ApplicationUser> userManager, IOptions<JWT> jWT)
        {
            _userManager = userManager;
            _JWT = jWT.Value;
        }

        public async Task<(string token, DateTime expires)> CreateTokenAsync(User user)
        {
            
            var applicationUser = await _userManager.FindByEmailAsync(user.Email);

            var userClaims = await _userManager.GetClaimsAsync(applicationUser);
            var roles = await _userManager.GetRolesAsync(applicationUser);

            var Claims= new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub,applicationUser.UserName!),
                new Claim(JwtRegisteredClaimNames.Email,applicationUser.Email!),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, applicationUser.Id)
            };

            foreach (var userClaim in userClaims)
            {
                Claims.Add(userClaim);
            }

            foreach (var role in roles)
            {
                Claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var Description = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(Claims),
                Issuer= _JWT.Issuer,
                Audience= _JWT.Audience,
                NotBefore = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(_JWT.ExpirationTimeInMin),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_JWT.Key!)), SecurityAlgorithms.HmacSha256)
            };

            var jwtHandler = new JwtSecurityTokenHandler();
            var token = jwtHandler.CreateToken(Description);

            return (jwtHandler.WriteToken(token), token.ValidTo);
        }
    }
}
