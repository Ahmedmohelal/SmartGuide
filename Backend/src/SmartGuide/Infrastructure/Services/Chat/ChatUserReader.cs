using Application.Services.Interfaces.Chat;
using Application.Services.Interfaces.PictureMaker;
using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Services.Chat
{
    public sealed class ChatUserReader : IChatUserReader
    {
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IImageUrlService _imageUrlService;

        public ChatUserReader(UserManager<ApplicationUser> userManager,
            IImageUrlService imageUrlService)
        {
            _userManager = userManager;
            _imageUrlService = imageUrlService;
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

        public async Task<string?> GetFullNameAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return null;

            var display = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrEmpty(display) ? user.UserName ?? user.Email ?? user.Id : display;    
        }

        public async Task<string?> GetProfilePictureUrlAsync(string userId, CancellationToken cancellationToken = default)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return null;
            var photo = _imageUrlService.ToPublicImageUrl(user.ProfileImage, "profileImages");
            if (photo != null)
                return photo;
            return null;
        }
    }
}
