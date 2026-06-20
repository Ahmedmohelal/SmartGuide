using Application.DTOs;
using Application.DTOs.Notifications;
using Application.Services.Interfaces.Notifications;
using Domain.Entities.Notifications;
using Infrastructure.Data;
using Infrastructure.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Services.Notifications
{
    public class NotificationService : INotificationService
    {
        public NotificationService(ApplicationDbContext context, IHubContext<NotificationHub> hubContext, ILogger<NotificationService> logger, IFirebaseNotificationService firebaseNotificationService)
        {
            _context = context;
            _hubContext = hubContext;
            _logger = logger;
            _firebaseNotificationService = firebaseNotificationService;
        }

        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;
        private readonly IFirebaseNotificationService _firebaseNotificationService;



        public async Task SendAsync(string userId, string title, string message, NotificationType type,string? referenceId = null,string? referenceType = null,CancellationToken cancellationToken = default)
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Title = title,
                Message = message,
                NotificationType = type,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Notifications.AddAsync(notification, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            try
            {
                await _hubContext.Clients
                    .Group($"User_{userId}")
                    .SendAsync(
                        "ReceiveNotification",
                        MapToDto(notification),
                        cancellationToken);

            }
            catch (Exception ex)
            {

                _logger.LogWarning(ex,
                                    "Real-time delivery failed for user {UserId}. " +
                                    "Notification saved in DB as fallback.", userId);
            }
            await SendFcmNotificationAsync(userId, title, message, cancellationToken);

        }


       public async Task SendToMultipleAsync(IEnumerable<string> userIds,string title,string message,
          NotificationType type,
          string? referenceId = null,
          string? referenceType = null,
          CancellationToken cancellationToken = default)
        {
            var idList = userIds.Distinct().ToList();

            var notifications = idList.Select(uid => new Notification
            {
                Id = Guid.NewGuid(),
                UserId = uid,
                Title = title,
                Message = message,
                NotificationType = type,
                IsRead = false,
                ReferenceId = referenceId,
                ReferenceType = referenceType,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            await _context.Notifications.AddRangeAsync(notifications, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);


            var tasks = notifications.Select(async n =>
            {
                try
                {
                    await _hubContext.Clients
                        .Group($"User_{n.UserId}")
                        .SendAsync(
                            "ReceiveNotification",
                            MapToDto(n),
                            cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Real-time delivery failed for user {UserId}.", n.UserId);
                }
            });

            await Task.WhenAll(tasks);

            var fcmTasks = notifications.Select(n => SendFcmNotificationAsync(n.UserId, n.Title, n.Message, cancellationToken));
            await Task.WhenAll(fcmTasks);
        }

        public async Task<NotificationListDto> GetUserNotificationsAsync(string userId,int page = 1,int pageSize = 20,
            CancellationToken cancellationToken = default)
        {
            pageSize = Math.Clamp(pageSize, 1, 50);
            page = Math.Max(1, page);

            var query = _context.Notifications
                .AsNoTracking()
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt);

            var total = await query.CountAsync(cancellationToken);
            var unread = await query.CountAsync(n => !n.IsRead, cancellationToken);

            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new NotificationListDto
            {
                Notifications = items.Select(MapToDto).ToList(),
                UnreadCount = unread,
                TotalCount = total
            };
        }
        public async Task<bool> MarkAsReadAsync(Guid notificationId,string userId,CancellationToken cancellationToken = default)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(
                    n => n.Id == notificationId && n.UserId == userId,
                    cancellationToken);

            if (notification is null) return false;

            notification.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        public async Task MarkAllAsReadAsync(string userId,
          CancellationToken cancellationToken = default)
        {
            await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(
                    s => s.SetProperty(n => n.IsRead, true),
                    cancellationToken);
        }

        public async Task<int> GetUnreadCountAsync(string userId,
          CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .AsNoTracking()
                .CountAsync(
                    n => n.UserId == userId && !n.IsRead,
                    cancellationToken);
        }

        public async Task<bool> DeleteAsync(Guid notificationId,string userId,
         CancellationToken cancellationToken = default)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(
                    n => n.Id == notificationId && n.UserId == userId,
                    cancellationToken);

            if (notification is null) return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }


        private async Task SendFcmNotificationAsync(
    string userId,
    string title,
    string message,
    CancellationToken cancellationToken = default)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(
                        x => x.Id == userId,
                        cancellationToken);

                if (string.IsNullOrWhiteSpace(user?.FcmToken))
                    return;

                await _firebaseNotificationService.SendAsync(
                    user.FcmToken,
                    title,
                    message);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "FCM delivery failed for user {UserId}",
                    userId);
            }
        }


        private static NotificationDTO MapToDto(Notification n) => new()
        {
            Id = n.Id,
            Title = n.Title,
            Message = n.Message,
            Type = n.NotificationType.ToString(),
            IsRead = n.IsRead,
            ReferenceId = n.ReferenceId,
            ReferenceType = n.ReferenceType,
            CreatedAtUtc = n.CreatedAt
        };
    }
}
