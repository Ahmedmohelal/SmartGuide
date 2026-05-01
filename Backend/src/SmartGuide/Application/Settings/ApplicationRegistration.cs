using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.Booking;
using Application.Services.Interfaces.Home;
using Application.Services.Interfaces.PictureMaker;
using Application.Services.Interfaces.Profiles;
using Application.Services.Interfaces.Tour;
using Application.Services.UseCases.Auth;
using Application.Services.UseCases.PictureMaker;
using Application.Services.UseCases.PlaceModule;
using Application.Services.UseCases.Profiles;
using Application.Services.UseCases.Tours;
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
            services.AddScoped<ITourGuideProfileService, TourGuideProfileService>();
            services.AddScoped<ITouristProfileService, TouristProfileService>();
            services.AddScoped<IAttachmentService, AttachmentService>();
            services.AddScoped<ITouristFavoritesService, TouristFavoritesService>();

            services.AddScoped<ITourService, TourService>();
            services.AddScoped<IPlaceService, PlaceService>();
            services.AddScoped<IBookingService, BookingService>();

            return services;

        }

    }
}
