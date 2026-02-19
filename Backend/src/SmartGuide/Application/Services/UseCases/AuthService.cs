using Application.DTOs;
using Application.Helper;
using Application.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.UseCases
{
    public class AuthService : IAuthService
    {

        private readonly ITokenService _tokenService;
        private readonly IUserService _userService;

        public AuthService(ITokenService tokenService, IUserService userService)
        {
            _tokenService = tokenService;
            _userService = userService;
        }

        public async Task<AuthDto> RegisterAsync(RegisterDto model)
        {
            if(await _userService.FindByEmailAsync(model.Email) is not null)
                return  new AuthDto{Message= ErrorMessages.EmailAlreadyExists };

            if (await _userService.FindByUserNameAsync(model.UserName) is not null)
                return new AuthDto{Message= ErrorMessages.UserNameAlreadyExists };

            if(model.ConfirmPassword != model.Password)
                return new AuthDto{Message= "Password and Confirm Password do not match." };

            var newUser=new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                UserName = model.UserName,
                Email = model.Email
            };


            var (appUser, errors) = await _userService.CreateAsync(newUser, model.Password);


            if (!string.IsNullOrEmpty(errors))
            {
                return new AuthDto{Message= errors};
            }
            var roleErrors = await _userService.AddToRoleAsync(appUser, Roles.Tourist);

            if (!string.IsNullOrEmpty(roleErrors))
            {
                return new AuthDto{Message= roleErrors};
            }

            var (token, expires) = await _tokenService.CreateTokenAsync(appUser);

            return new AuthDto
            {
                Message= "User Registered Successfully",
                IsAuthanticated = true,
                UserName = newUser.UserName,
                Email = newUser.Email,
                Token = token,
                ExpiresOn = expires,
                Roles = new List<string>{ Roles.Tourist }

            };

        }


        public async Task<AuthDto> GetTokenAsync(TokenRequestDto model)
        {
            var AuthModel = new AuthDto();

            var user = await _userService.FindByEmailAsync(model.Email);

            if (user is null || !await _userService.CheckPasswordAsync(user, model.Password))
                return new AuthDto { Message = "Email or Password Is in correct" };

            var (token,expirey)= await _tokenService.CreateTokenAsync(user);
            var roles = await _userService.GetRolesAsync(user);


            AuthModel.Email = user.Email;
            AuthModel.UserName = user.UserName;
            AuthModel.ExpiresOn = expirey;
            AuthModel.IsAuthanticated = true;
            AuthModel.Token = token;
            AuthModel.Roles = roles.ToList();

            return AuthModel;

        }


        public async Task<string> AddRoleAsync(AddRoleDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);

            if (user is null || !_userService.RoleExistsAsync(model.Role).Result)
                return "User or Role  Not Found";

            if (await _userService.IsInRoleAsync(user, model.Role))
                return "User already assigned to this role";

            var res = await _userService.AddToRoleAsync(user, model.Role);

            if (!string.IsNullOrEmpty(res))
                return res;

            return "Role Added to User Successfully";

        }
    }
}
