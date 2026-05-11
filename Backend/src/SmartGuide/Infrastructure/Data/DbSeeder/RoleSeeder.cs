using Microsoft.AspNetCore.Identity;

namespace Infrastructure.Data.DbSeeder
{
    public class RoleSeeder
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RoleSeeder(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task SeedRolesDataAsync()
        {
            string[] roles =
            {
                "Admin",
                "Tourist",
                "TourGuide"
            };

            foreach (var role in roles)
            {
                var exists = await _roleManager.RoleExistsAsync(role);

                if (!exists)
                {
                    await _roleManager.CreateAsync(
                        new IdentityRole(role));
                }
            }
        }
    }
}