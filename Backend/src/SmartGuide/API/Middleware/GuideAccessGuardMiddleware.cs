using Infrastructure.Data;
using Infrastructure.Data.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Middleware
{
    public class GuideAccessGuardMiddleware
    {
        private readonly RequestDelegate _next;

        public GuideAccessGuardMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ApplicationDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true &&
                context.User.IsInRole("TourGuide"))
            {
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var guide = await dbContext.Users
                        .AsNoTracking()
                        .Where(x => x.Id == userId)
                        .Select(x => new { x.GuideAccountStatus, x.ForceLogoutRequired })
                        .FirstOrDefaultAsync();

                    if (guide != null)
                    {
                        if (guide.ForceLogoutRequired)
                        {
                            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                            await context.Response.WriteAsJsonAsync(new
                            {
                                message = "Session expired by admin action. Please login again."
                            });
                            return;
                        }

                        if (guide.GuideAccountStatus == GuideAccountStatus.Suspended ||
                            guide.GuideAccountStatus == GuideAccountStatus.Banned)
                        {
                            context.Response.StatusCode = StatusCodes.Status403Forbidden;
                            await context.Response.WriteAsJsonAsync(new
                            {
                                message = $"Guide account is {guide.GuideAccountStatus}."
                            });
                            return;
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
