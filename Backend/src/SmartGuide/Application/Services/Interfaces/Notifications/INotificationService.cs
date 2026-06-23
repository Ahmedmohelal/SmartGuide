using Application.DTOs.Notifications;
using Domain.Entities.Notifications;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Notifications
{
    public interface INotificationService
    {

        Task SendAsync(
         string userId,
         string title,
         string message,
         NotificationType type,
         string? referenceId = null,
         string? referenceType = null,
         CancellationToken cancellationToken = default);

        Task SendToMultipleAsync(
            IEnumerable<string> userIds,
            string title,
            string message,
            NotificationType type,
            string? referenceId = null,
            string? referenceType = null,
            CancellationToken cancellationToken = default);

        Task<NotificationListDto> GetUserNotificationsAsync(
            string userId,
            int page = 1,
            int pageSize = 20,
            CancellationToken cancellationToken = default);

        Task<bool> MarkAsReadAsync(
            Guid notificationId,
            string userId,
            CancellationToken cancellationToken = default);

        Task MarkAllAsReadAsync(
            string userId,
            CancellationToken cancellationToken = default);

        Task<int> GetUnreadCountAsync(
            string userId,
            CancellationToken cancellationToken = default);

        Task<bool> DeleteAsync(
            Guid notificationId,
            string userId,
            CancellationToken cancellationToken = default);



    }
}
