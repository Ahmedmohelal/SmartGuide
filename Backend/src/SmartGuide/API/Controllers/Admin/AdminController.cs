using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        // =========================================================
        // Users
        // =========================================================

        [HttpGet("users")]
        [ProducesResponseType(typeof(List<AdminUserDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminUserDto>>> GetAllUsersAsync()
        {
            var result = await _userAdminService.GetAllUsersAsync();

            return Ok(result);
        }

        [HttpGet("users/{id}")]
        [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminUserDto>> GetUserByIdAsync(string id)
        {
            var result = await _userAdminService.GetUserByIdAsync(id);

            if (result == null)
                return NotFound(new { message = "User not found." });

            return Ok(result);
        }

        [HttpPut("users/{id}/deactivate")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> DeactivateUserAsync(string id)
        {
            var result = await _userAdminService.DeactivateUserAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("users/{id}/activate")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> ActivateUserAsync(string id)
        {
            var result = await _userAdminService.ActivateUserAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("users/{id}")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> DeleteUserAsync(string id)
        {
            var result = await _userAdminService.DeleteUserAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("create-admin")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> CreateAdminAsync(
            [FromForm] CreateAdminDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _userAdminService.CreateAdminAsync(dto);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // =========================================================
        // Guide Verification
        // =========================================================

        [HttpGet("guides/pending")]
        [ProducesResponseType(typeof(List<AdminGuideVerificationDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminGuideVerificationDto>>> GetPendingGuidesAsync()
        {
            var result = await _guideAdminService.GetPendingGuidesAsync();

            return Ok(result);
        }

        [HttpGet("guides")]
        [ProducesResponseType(typeof(List<AdminGuideVerificationDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminGuideVerificationDto>>> GetAllGuidesAsync()
        {
            var result = await _guideAdminService.GetAllGuidesAsync();

            return Ok(result);
        }

        [HttpGet("guides/{guideId}/documents")]
        [ProducesResponseType(typeof(GuideDocumentsDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GuideDocumentsDto>> GetGuideDocumentsAsync(
            string guideId)
        {
            var result = await _guideAdminService
                .GetGuideDocumentsAsync(guideId);

            if (result == null)
                return NotFound(new { message = "Guide not found" });

            return Ok(result);
        }

        [HttpPut("guides/{id}/approve")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> ApproveGuideAsync(
            string id)
        {
            var result = await _guideAdminService.ApproveGuideAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("guides/{id}/reject")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> RejectGuideAsync(
            string id,
            [FromBody] RejectGuideDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result =
                await _guideAdminService.RejectGuideAsync(
                    id,
                    dto.Reason);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/activate")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> ActivateGuideAsync(
            string id,
            [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideAdminService.ActivateGuideAsync(
                    id,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/suspend")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> SuspendGuideAsync(
            string id,
            [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideAdminService.SuspendGuideAsync(
                    id,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/ban")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> BanGuideAsync(
            string id,
            [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideAdminService.BanGuideAsync(
                    id,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/under-review")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>>
            PutGuideUnderReviewAsync(
                string id,
                [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideAdminService.PutUnderReviewAsync(
                    id,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("guides/{id}/force-logout")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>>
            ForceLogoutGuideAsync(
                string id,
                [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideAdminService.ForceLogoutGuideAsync(
                    id,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // =========================================================
        // Wallet
        // =========================================================

        [HttpGet("guides/{id}/wallet")]
        [ProducesResponseType(typeof(GuideWalletDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GuideWalletDto>> GetGuideWalletAsync(
            string id)
        {
            var result =
                await _guideWalletAdminService.GetWalletAsync(id);

            if (result == null)
                return BadRequest("Not Found TourGuide With This Id");

            return Ok(result);
        }

        [HttpGet("guides/{id}/wallet/transactions")]
        [ProducesResponseType(typeof(List<GuideWalletTransactionDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<GuideWalletTransactionDto>>>
            GetGuideWalletTransactionsAsync(
                string id,
                [FromQuery] int take = 100)
        {
            var result =
                await _guideWalletAdminService
                    .GetTransactionsAsync(id, take);

            return Ok(result);
        }

        [HttpPost("guides/{id}/wallet/add-balance")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> AddBalanceAsync(
            string id,
            [FromBody] GuideWalletAdjustmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideWalletAdminService.AddBalanceAsync(
                    id,
                    adminId,
                    dto,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPost("guides/{id}/wallet/deduct-balance")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> DeductBalanceAsync(
            string id,
            [FromBody] GuideWalletAdjustmentDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideWalletAdminService.DeductBalanceAsync(
                    id,
                    adminId,
                    dto,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/wallet/freeze")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> FreezeWalletAsync(
            string id,
            [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideWalletAdminService.SetFreezeStateAsync(
                    id,
                    true,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPatch("guides/{id}/wallet/unfreeze")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> UnfreezeWalletAsync(
            string id,
            [FromBody] GuideAccountStatusUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var adminId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? string.Empty;

            var result =
                await _guideWalletAdminService.SetFreezeStateAsync(
                    id,
                    false,
                    adminId,
                    dto.Reason,
                    HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // =========================================================
        // Tours
        // =========================================================

        [HttpGet("tours")]
        [ProducesResponseType(typeof(List<AdminTourDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminTourDto>>> GetAllToursAsync()
        {
            var result = await _tourAdminService.GetAllToursAsync();

            return Ok(result);
        }

        [HttpPut("tours/{id}/deactivate")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> DeactivateTourAsync(
            Guid id)
        {
            var result = await _tourAdminService.DeactivateTourAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpPut("tours/{id}/activate")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> ActivateTourAsync(
            Guid id)
        {
            var result = await _tourAdminService.ActivateTourAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpDelete("tours/{id}")]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(OperationResultDto), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<OperationResultDto>> DeleteTourAsync(
            Guid id)
        {
            var result = await _tourAdminService.DeleteTourAsync(id);

            if (!result.IsSuccess)
                return BadRequest(result);

            return Ok(result);
        }

        // =========================================================
        // Bookings
        // =========================================================

        [HttpGet("bookings")]
        [ProducesResponseType(typeof(List<AdminBookingDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminBookingDto>>>
            GetAllBookingsAsync(
                [FromQuery] string? status = null,
                [FromQuery] string? guideId = null)
        {
            var result =
                await _bookingAdminService
                    .GetAllBookingsAsync(status, guideId);

            return Ok(result);
        }

        [HttpDelete("{bookingId:guid}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CancelBookingAsync(
            Guid bookingId)
        {
            var requesterId =
                User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(requesterId))
                return Unauthorized();

            var result =
                await _bookingAdminService
                    .CancelBookingAsync(bookingId, requesterId);

            if (!result)
            {
                return BadRequest(new
                {
                    IsSuccess = false,
                    Message = "Booking not found or already cancelled."
                });
            }

            return Ok(new
            {
                IsSuccess = true,
                Message = "Booking cancelled successfully."
            });
        }

        // =========================================================
        // Statistics
        // =========================================================

        [HttpGet("statistics")]
        [ProducesResponseType(typeof(AdminStatisticsDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminStatisticsDto>>
            GetStatisticsAsync()
        {
            var result =
                await _adminService.GetStatisticsAsync();

            return Ok(result);
        }

        // =========================================================
        // Revenue
        // =========================================================

        [HttpGet("revenue")]
        [ProducesResponseType(typeof(AdminRevenueDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminRevenueDto>>
            GetRevenueAsync()
        {
            var result =
                await _adminService.GetRevenueAsync();

            return Ok(result);
        }

        // =========================================================
        // Audit Logs
        // =========================================================

        [HttpGet("audit-logs")]
        [ProducesResponseType(typeof(List<AdminAuditLogDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<List<AdminAuditLogDto>>>
            GetAuditLogsAsync(
                [FromQuery] int take = 100)
        {
            var result =
                await _adminAuditService.GetRecentAsync(take);

            return Ok(result);
        }
    }
}
