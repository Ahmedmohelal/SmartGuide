using Application.DTOs.Notifications;
using Application.Services.Interfaces.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace API.Controllers.Notifications
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }
        // Called when user opens the app to fetch all notifications from DB
        [HttpGet]
        public async Task<ActionResult<NotificationListDto>> GetMyNotificationsAsync([FromQuery] int page = 1, [FromQuery] int pageSize = 20,
           CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var result = await _notificationService
                          .GetUserNotificationsAsync(userId, page, pageSize, cancellationToken);
            return Ok(result);

        }


        // Called to show unread badge count in navbar
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCountAsync(CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var count = await _notificationService.GetUnreadCountAsync(userId, cancellationToken);

            return Ok(new { unreadCount = count });
        }

        [HttpPatch("{notificationId:guid}/read")]
        public async Task<IActionResult> MarkAsReadAsync(Guid notificationId,CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var result = await _notificationService
                .MarkAsReadAsync(notificationId, userId, cancellationToken);

            if (!result)
                return NotFound(new { message = "Notification not found." });

            return Ok(new { message = "Marked as read." });
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsReadAsync(CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            await _notificationService.MarkAllAsReadAsync(userId, cancellationToken);
            return Ok(new { message = "All notifications marked as read." });
        }

        [HttpDelete("{notificationId:guid}")]
        public async Task<IActionResult> DeleteAsync(
         Guid notificationId,
         CancellationToken cancellationToken = default)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

            var result = await _notificationService
                .DeleteAsync(notificationId, userId, cancellationToken);

            if (!result)
                return NotFound(new { message = "Notification not found." });

            return Ok(new { message = "Notification deleted." });
        }

    }
}
