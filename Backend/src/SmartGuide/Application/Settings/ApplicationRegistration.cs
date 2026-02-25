using Application.Services.Interfaces;
using Application.Services.UseCases;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Settings
{
    public static class ApplicationRegistration
    {
        public static IServiceCollection  ApplicationConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddScoped<IAuthService, AuthService>();

            return services;
        }

    }
}
