using Application.Services.Interfaces.Notifications;
using FirebaseAdmin.Messaging;

namespace Infrastructure.Services.Notifications
{
    public class FirebaseNotificationService
    : IFirebaseNotificationService
    {
        public async Task SendAsync(
            string token,
            string title,
            string body)
        {
            var message = new Message
            {
                Token = token,

                Notification = new Notification
                {
                    Title = title,
                    Body = body
                }
            };

            await FirebaseMessaging
                .DefaultInstance
                .SendAsync(message);
        }
    }
}