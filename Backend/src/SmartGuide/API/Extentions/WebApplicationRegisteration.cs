using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Extentions
{
    public static class WebApplicationRegisteration
    {
        public async static Task<WebApplication> MigrateDataBaseAsync(this WebApplication app)
        {
            await using var scope = app.Services.CreateAsyncScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var Pending = await dbContext.Database.GetPendingMigrationsAsync();
            if (Pending.Any())
            {
                await dbContext.Database.MigrateAsync();
            }
            return app;
        }
    }
}
