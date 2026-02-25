using Application.DTOs;
using Application.Services.Interfaces;
using Application.Services.UseCases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }



        [HttpPost("register")]
        public async Task<IActionResult> RegisterAsync([FromBody] RegisterDto model)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(model);

            if (!result.IsAuthanticated)
                return BadRequest(result.Message);


            return Ok(result);

        }


        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync([FromBody] TokenRequestDto model)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.GetTokenAsync(model);

            if (!result.IsAuthanticated)
                return BadRequest(result.Message);


            return Ok(result);

        }

        [HttpPost("refreshtoken")]
        public async Task<IActionResult> RefreshTokenAsync([FromBody] RefreshTokenRequestDto model)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(model.RefreshToken))
                return BadRequest(new { errorCode = "InvalidRequest", errorMessage = "Refresh token is required." });

            var result = await _authService.RefreshTokenAsync(model.RefreshToken);

            if (!result.IsSuccess)
                return Unauthorized(new { result.ErrorCode, result.ErrorMessage });

            return Ok(result.Auth);
        }

        [HttpPost("addRole")]
        public async Task<IActionResult> AddRoleAsync([FromBody] AddRoleDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.AddRoleAsync(model);

            if (string.IsNullOrEmpty(result))
                return BadRequest(result);

            return Ok(new { result, model });

        }

    }
}
