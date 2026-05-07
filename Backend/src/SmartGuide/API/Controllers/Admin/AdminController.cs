using Application.DTOs.AdminDashboard;
using Application.Services.Interfaces.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers.Admin
{

    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        // ==================== Users ====================

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            var result = await _adminService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserByIdAsync(string id)
        {
            var result = await _adminService.GetUserByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "User not found." });
            return Ok(result);
        }

        [HttpPut("users/{id}/deactivate")]
        public async Task<IActionResult> DeactivateUserAsync(string id)
        {
            var result = await _adminService.DeactivateUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("users/{id}/activate")]
        public async Task<IActionResult> ActivateUserAsync(string id)
        {
            var result = await _adminService.ActivateUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUserAsync(string id)
        {
            var result = await _adminService.DeleteUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        // ==================== Guide Verification ====================

        [HttpGet("guides/pending")]
        public async Task<IActionResult> GetPendingGuidesAsync()
        {
            var result = await _adminService.GetPendingGuidesAsync();
            return Ok(result);
        }

        [HttpGet("guides")]
        public async Task<IActionResult> GetAllGuidesAsync()
        {
            var result = await _adminService.GetAllGuidesAsync();
            return Ok(result);
        }

        [HttpPut("guides/{id}/approve")]
        public async Task<IActionResult> ApproveGuideAsync(string id)
        {
            var result = await _adminService.ApproveGuideAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("guides/{id}/reject")]
        public async Task<IActionResult> RejectGuideAsync(
            string id, [FromBody] RejectGuideDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _adminService.RejectGuideAsync(id, dto.Reason);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        // ==================== Tours ====================

        [HttpGet("tours")]
        public async Task<IActionResult> GetAllToursAsync()
        {
            var result = await _adminService.GetAllToursAsync();
            return Ok(result);
        }

        [HttpPut("tours/{id}/deactivate")]
        public async Task<IActionResult> DeactivateTourAsync(Guid id)
        {
            var result = await _adminService.DeactivateTourAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("tours/{id}/activate")]
        public async Task<IActionResult> ActivateTourAsync(Guid id)
        {
            var result = await _adminService.ActivateTourAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("tours/{id}")]
        public async Task<IActionResult> DeleteTourAsync(Guid id)
        {
            var result = await _adminService.DeleteTourAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        // ==================== Bookings ====================

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookingsAsync(
            [FromQuery] string? status = null,
            [FromQuery] string? guideId = null)
        {
            var result = await _adminService.GetAllBookingsAsync(status, guideId);
            return Ok(result);
        }

        // ==================== Statistics ====================

        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatisticsAsync()
        {
            var result = await _adminService.GetStatisticsAsync();
            return Ok(result);
        }

        // ==================== Revenue ====================

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueAsync()
        {
            var result = await _adminService.GetRevenueAsync();
            return Ok(result);
        }
    }
}
