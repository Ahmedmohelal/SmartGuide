using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Infrastructure.Hubs
{
    [Authorize]
    public class NotificationHub : Hub 
    {
        public override async Task OnConnectedAsync()
        {
            var UserId= Context?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if(!string.IsNullOrWhiteSpace(UserId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{UserId}");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var UserId= Context?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            if(!string.IsNullOrWhiteSpace(UserId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"User_{UserId}");
            }
             await base.OnDisconnectedAsync(exception);
        }
    }
}
