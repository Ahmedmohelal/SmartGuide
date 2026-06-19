using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Auth;
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
        public async Task<ActionResult<AuthDto>> RegisterAsync([FromForm] RegisterDto model)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.RegisterAsync(model);

            Console.WriteLine($"RT => {result.RefreshToken}");
            Console.WriteLine($"RTT => {result.RefreshTokenExpiresOn}");

            if (!result.IsAuthenticated)
                return BadRequest(result.Message);


            return Ok(result);

        }


        [HttpPost("login")]
        public async Task<ActionResult<AuthDto>> LoginAsync([FromBody] TokenRequestDto model)
        {

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.GetTokenAsync(model);

            if (!result.IsAuthenticated)
                return BadRequest(result.Message);


            return Ok(result);

        }

        [HttpPost("refreshtoken")]
        public async Task<ActionResult<AuthDto>> RefreshTokenAsync([FromBody] RefreshTokenRequestDto model)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(model.RefreshToken))
                return BadRequest(new { errorCode = "InvalidRequest", errorMessage = "Refresh token is required." });

            var result = await _authService.RefreshTokenAsync(model.RefreshToken);

            if (!result.IsSuccess)
                return Unauthorized(new { result.ErrorCode, result.ErrorMessage });

            return Ok(result.Auth);
        }

        [HttpPost("addRole")]
        [Authorize]
        public async Task<IActionResult> AddRoleAsync([FromBody] AddRoleDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.AddRoleAsync(model);

            if (string.IsNullOrEmpty(result))
                return BadRequest(result);

            return Ok(new { result, model });
        }

        [HttpPost("forgot-password")]
        [AllowAnonymous]
        public async Task<ActionResult<OperationResultDto>> ForgotPasswordAsync([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ForgotPasswordAsync(model);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("send-reset-otp")]
        [AllowAnonymous]
        public async Task<ActionResult<OperationResultDto>> SendResetOtpAsync([FromBody] SendResetOtpDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.SendResetOtpAsync(model);

            if (!result.IsSuccess && result.Message == "User not found.")
                return NotFound(result);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("verify-reset-otp")]
        [AllowAnonymous]
        public async Task<ActionResult<OperationResultDto>> VerifyResetOtpAsync([FromBody] VerifyResetOtpDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.VerifyResetOtpAsync(model);

            if (!result.IsSuccess && result.Message == "User not found.")
                return NotFound(result);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

       
        [HttpPost("reset-password")]
        [AllowAnonymous]
        public async Task<ActionResult<OperationResultDto>> ResetPasswordAsync([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ResetPasswordAsync(model);

            if (!result.IsSuccess && result.Message == "User not found.")
                return NotFound(result);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

      
        [HttpPost("google-login")]
        [AllowAnonymous]
        public async Task<ActionResult<AuthResponseDto>> GoogleLoginAsync([FromBody] GoogleLoginRequestDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.GoogleLoginAsync(model.IdToken);

            if (!result.IsSuccess)
                return BadRequest(result.Message);

            return Ok(result.Auth);
        }


        [HttpPost("logout")]
        [Authorize ]
        public async Task<IActionResult> LogoutAsync([FromBody] LogoutRequestDto model)
        {
            var result = await _authService.LogoutAsync(model, HttpContext.RequestAborted);

            if (!result.IsSuccess)
                return BadRequest(new { errorCode = "LogoutFailed", errorMessage = "Failed to log out." });

            return Ok(new { message = "Logged out successfully." });

        }
    }
}
