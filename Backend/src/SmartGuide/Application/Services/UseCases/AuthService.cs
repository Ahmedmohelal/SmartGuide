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
        private readonly IRefreshTokenService _refreshTokenService;

        public AuthService(ITokenService tokenService, IUserService userService, IRefreshTokenService refreshTokenService)
        {
            _tokenService = tokenService;
            _userService = userService;
            _refreshTokenService = refreshTokenService;
        }

        public async Task<AuthDto> RegisterAsync(RegisterDto model)
        {
            if (await _userService.FindByEmailAsync(model.Email) is not null)
                return new AuthDto { Message = ErrorMessages.EmailAlreadyExists };

            if (await _userService.FindByUserNameAsync(model.UserName) is not null)
                return new AuthDto { Message = ErrorMessages.UserNameAlreadyExists };

            if (model.ConfirmPassword != model.Password)
                return new AuthDto { Message = "Password and Confirm Password do not match." };

            var newUser = new User
            {
                FirstName = model.FirstName,
                LastName = model.LastName,
                UserName = model.UserName,
                Email = model.Email
            };


            var (appUser, errors) = await _userService.CreateAsync(newUser, model.Password);


            if (!string.IsNullOrEmpty(errors))
            {
                return new AuthDto { Message = errors };
            }
            var roleErrors = await _userService.AddToRoleAsync(appUser, Roles.Tourist);

            if (!string.IsNullOrEmpty(roleErrors))
            {
                return new AuthDto { Message = roleErrors };
            }

            var (token, expires) = await _tokenService.CreateTokenAsync(appUser);
            var (refreshToken, refreshExpires) = await _refreshTokenService.CreateAsync(appUser.Id);

            return new AuthDto
            {
                Message = "User Registered Successfully",
                IsAuthanticated = true,
                UserName = newUser.UserName,
                Email = newUser.Email,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = refreshExpires,
                Roles = new List<string> { Roles.Tourist }
            };

        }


        public async Task<AuthDto> GetTokenAsync(TokenRequestDto model)
        {
            var user = await _userService.FindByEmailAsync(model.Email);

            if (user is null || !await _userService.CheckPasswordAsync(user, model.Password))
                return new AuthDto { Message = "Email or Password Is incorrect" };

            var (token, expires) = await _tokenService.CreateTokenAsync(user);
            var (refreshToken, refreshExpires) = await _refreshTokenService.CreateAsync(user.Id);
            var roles = await _userService.GetRolesAsync(user);

            return new AuthDto
            {
                Message = "Login successful",
                IsAuthanticated = true,
                Email = user.Email,
                UserName = user.UserName,
                Token = token,
                RefreshToken = refreshToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = refreshExpires,
                Roles = roles
            };
        }

        public async Task<AuthRefreshResult> RefreshTokenAsync(string refreshToken)
        {
            var result = await _refreshTokenService.ValidateAndRotateAsync(refreshToken);

            if (!result.IsValid || result.User == null)
                return AuthRefreshResult.Failure(result.ErrorCode, result.ErrorMessage);

            var (token, expires) = await _tokenService.CreateTokenAsync(result.User);
            var roles = await _userService.GetRolesAsync(result.User);

            var auth = new AuthDto
            {
                Message = "Token refreshed successfully",
                IsAuthanticated = true,
                Email = result.User.Email,
                UserName = result.User.UserName,
                Token = token,
                RefreshToken = result.NewPlainToken,
                ExpiresOn = expires,
                RefreshTokenExpiresOn = result.NewTokenExpiresAt,
                Roles = roles
            };

            return AuthRefreshResult.Success(auth);
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
