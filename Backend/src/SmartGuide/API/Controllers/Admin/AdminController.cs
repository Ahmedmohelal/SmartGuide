using Application.DTOs.AdminDashboard;
using Application.Services.Interfaces.Admin;
using Infrastructure.Services.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Admin
{

    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserAdminService _userAdminService;
        private readonly IGuideAdminService _guideAdminService;
        private readonly ITourAdminService _tourAdminService;
        private readonly IBookingAdminService _bookingAdminService;
        private readonly IAdminDashboardService _adminService;
        private readonly IGuideWalletAdminService _guideWalletAdminService;
        private readonly IAdminAuditService _adminAuditService;


        public AdminController(
            IUserAdminService userAdminService,
            IGuideAdminService guideAdminService,
            ITourAdminService tourAdminService,
            IBookingAdminService bookingAdminService,
            IAdminDashboardService adminService,
            IGuideWalletAdminService guideWalletAdminService,
            IAdminAuditService adminAuditService)
        {
            _userAdminService = userAdminService;
            _guideAdminService = guideAdminService;
            _tourAdminService = tourAdminService;
            _bookingAdminService = bookingAdminService;
            _adminService = adminService;
            _guideWalletAdminService = guideWalletAdminService;
            _adminAuditService = adminAuditService;
        }

        // ==================== Users ====================

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsersAsync()
        {
            var result = await _userAdminService.GetAllUsersAsync();
            return Ok(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserByIdAsync(string id)
        {
            var result = await _userAdminService.GetUserByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "User not found." });
            return Ok(result);
        }

        [HttpPut("users/{id}/deactivate")]
        public async Task<IActionResult> DeactivateUserAsync(string id)
        {
            var result = await _userAdminService.DeactivateUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("users/{id}/activate")]
        public async Task<IActionResult> ActivateUserAsync(string id)
        {
            var result = await _userAdminService.ActivateUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUserAsync(string id)
        {
            var result = await _userAdminService.DeleteUserAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdminAsync([FromForm] CreateAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userAdminService.CreateAdminAsync(dto);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        // ==================== Guide Verification ====================

        [HttpGet("guides/pending")]
        public async Task<IActionResult> GetPendingGuidesAsync()
        {
            var result = await _guideAdminService.GetPendingGuidesAsync();
            return Ok(result);
        }

        [HttpGet("guides/{guideId}/documents")]
        public async Task<IActionResult> GetGuideDocumentsAsync(string guideId)
        {
            var result = await _guideAdminService.GetGuideDocumentsAsync(guideId);

            if (result == null)
                return NotFound(new { message = "Guide not found" });

            return Ok(result);
        }

        [HttpGet("guides")]
        public async Task<IActionResult> GetAllGuidesAsync()
        {
            var result = await _guideAdminService.GetAllGuidesAsync();
            return Ok(result);
        }

        [HttpPut("guides/{id}/approve")]
        public async Task<IActionResult> ApproveGuideAsync(string id)
        {
            var result = await _guideAdminService.ApproveGuideAsync(id);
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

            var result = await _guideAdminService.RejectGuideAsync(id, dto.Reason);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/activate")]
        public async Task<IActionResult> ActivateGuideAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideAdminService.ActivateGuideAsync(id, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/suspend")]
        public async Task<IActionResult> SuspendGuideAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideAdminService.SuspendGuideAsync(id, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/ban")]
        public async Task<IActionResult> BanGuideAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideAdminService.BanGuideAsync(id, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/under-review")]
        public async Task<IActionResult> PutGuideUnderReviewAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideAdminService.PutUnderReviewAsync(id, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("guides/{id}/force-logout")]
        public async Task<IActionResult> ForceLogoutGuideAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideAdminService.ForceLogoutGuideAsync(id, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("guides/{id}/wallet")]
        public async Task<IActionResult> GetGuideWalletAsync(string id)
        {
            var result = await _guideWalletAdminService.GetWalletAsync(id);
            if (result == null)
                return BadRequest("Not Found TourGuide With This Id");

            return Ok(result);
        }

        [HttpGet("guides/{id}/wallet/transactions")]
        public async Task<IActionResult> GetGuideWalletTransactionsAsync(string id, [FromQuery] int take = 100)
        {
            var result = await _guideWalletAdminService.GetTransactionsAsync(id, take);
            return Ok(result);
        }

        [HttpPost("guides/{id}/wallet/add-balance")]
        public async Task<IActionResult> AddBalanceAsync(string id, [FromBody] GuideWalletAdjustmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideWalletAdminService.AddBalanceAsync(id, adminId, dto, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("guides/{id}/wallet/deduct-balance")]
        public async Task<IActionResult> DeductBalanceAsync(string id, [FromBody] GuideWalletAdjustmentDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideWalletAdminService.DeductBalanceAsync(id, adminId, dto, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/wallet/freeze")]
        public async Task<IActionResult> FreezeWalletAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideWalletAdminService.SetFreezeStateAsync(id, true, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPatch("guides/{id}/wallet/unfreeze")]
        public async Task<IActionResult> UnfreezeWalletAsync(string id, [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var result = await _guideWalletAdminService.SetFreezeStateAsync(id, false, adminId, dto.Reason, HttpContext.Connection.RemoteIpAddress?.ToString());
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        // ==================== Tours ====================

        [HttpGet("tours")]
        public async Task<IActionResult> GetAllToursAsync()
        {
            var result = await _tourAdminService.GetAllToursAsync();
            return Ok(result);
        }

        [HttpPut("tours/{id}/deactivate")]
        public async Task<IActionResult> DeactivateTourAsync(Guid id)
        {
            var result = await _tourAdminService.DeactivateTourAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("tours/{id}/activate")]
        public async Task<IActionResult> ActivateTourAsync(Guid id)
        {
            var result = await _tourAdminService.ActivateTourAsync(id);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("tours/{id}")]
        public async Task<IActionResult> DeleteTourAsync(Guid id)
        {
            var result = await _tourAdminService.DeleteTourAsync(id);
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
            var result = await _bookingAdminService.GetAllBookingsAsync(status, guideId);
            return Ok(result);
        }

        [HttpDelete("{bookingId}")]
        public async Task<IActionResult> CancelBookingAsync(Guid bookingId)
        {
            var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(requesterId))
                return Unauthorized();

            var result = await _bookingAdminService
                .CancelBookingAsync(bookingId, requesterId);

            if (!result)
                return BadRequest(new { IsSuccess = false, Message = "Booking not found or already cancelled." });
            return Ok(new { IsSuccess = true, Message = "Booking cancelled successfully." });
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

        [HttpGet("audit-logs")]
        public async Task<IActionResult> GetAuditLogsAsync([FromQuery] int take = 100)
        {
            var result = await _adminAuditService.GetRecentAsync(take);
            return Ok(result);
        }
    }
}
