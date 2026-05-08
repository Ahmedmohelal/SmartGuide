using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.DbSeeder
{



    public class IdentitySeeder
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public IdentitySeeder(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        public async Task SeedAsync()
        {
            var adminEmail = "sawsanelsebay2@gmail.com";

            var admin = await _userManager.FindByEmailAsync(adminEmail);

            if (admin != null)
                return;

            admin = new ApplicationUser
            {
                UserName = "Sawsan",
                Email = adminEmail,
                EmailConfirmed = true,

                FirstName = "Sawsan",
                LastName = "Admin",

                Country = "Egypt",
                Role = "Admin"

            };

            var result = await _userManager.CreateAsync(admin, "Admin@123");

            if (!result.Succeeded)
            {
                throw new Exception(
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            await _userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}