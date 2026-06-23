using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Services.Interfaces.Notifications
{
    public interface IFirebaseNotificationService
    {
        Task SendAsync(
            string token,
            string title,
            string body);
    }
}
