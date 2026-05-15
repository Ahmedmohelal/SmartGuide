using Application.Services.Interfaces.Chat;
using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services.Chat
{
    public sealed class ChatUserReader : IChatUserReader
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public ChatUserReader(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task<UserChatContext?> GetAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return null;

            var display = $"{user.FirstName} {user.LastName}".Trim();
            return new UserChatContext
            {
                UserId = user.Id,
                Role = user.Role,
                DisplayName = string.IsNullOrEmpty(display) ? user.UserName ?? user.Email ?? user.Id : display
            };
        }
    }
}
