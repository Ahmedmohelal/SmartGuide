using Application.DTOs.ProfileDTOs;
using Application.DTOs.Saved;
using Application.Services.Interfaces;
using Application.Services.Interfaces.Tour;
using Domain.Entities.Home;

using Domain.Interfaces;
using Infrastructure.Data;
using Infrastructure.Data.DbSeeder;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Repository.Book;
using Infrastructure.Repository.Home;
using Infrastructure.Repository.Profile;
using Infrastructure.Repository.Tours;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Email;
using Infrastructure.Services.Files;
using Infrastructure.Services.Identity;
using Infrastructure.Services.Token;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Infrastructure.Settings
{
    public static class InfrastructureRegistration
    {
        public static IServiceCollection InfrastructureConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("AhmedDefaultConnection"),
                        sqlOptions => sqlOptions.EnableRetryOnFailure()
));

            services.AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireDigit = false;
                options.Password.RequireUppercase = false;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();
            services.Configure<JWT>(configuration.GetSection("JWT"));

            var JWT = configuration.GetSection("JWT");
            services.AddAuthentication(
               options =>
               {
                   options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                   options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
               }).AddJwtBearer(op =>

                   op.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                   {
                       ValidateIssuer = true,
                       ValidateAudience = true,
                       ValidateIssuerSigningKey = true,
                       ValidateLifetime = true,
                       ValidIssuer = JWT["Issuer"],
                       ValidAudience = JWT["Audience"],
                       IssuerSigningKey = new SymmetricSecurityKey(
                           System.Text.Encoding.UTF8.GetBytes(JWT["Key"]!)),
                       ClockSkew = TimeSpan.Zero
                   });

            //Repositories 
            services.AddScoped<ITourRepository, TourRepository>();
            services.AddScoped<IProfileRepository<TourGuideProfileDto, UpdateTourGuideProfileDto>, TourGuideProfileRepository>();
            services.AddScoped<IProfileRepository<TouristProfileDto, UpdateTouristProfileDto>, TouristProfileRepository>();
            services.AddScoped<ITouristFavoritesRepository<SavedTourGuideDto>, TouristFavoritesRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();


            //Services
            services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));
            services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));

            services.AddHttpContextAccessor();
            services.AddScoped<IImageUrlService, ImageUrlService>();

            services.AddScoped<IUserService, UserServiceAdapter>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IRefreshTokenService, RefreshTokenService>();
            services.AddScoped<IGoogleAuthService, GoogleAuthService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IProfileInitializerService, ProfileInitializerService>();
         


           services.AddScoped<ITouristFavoritesRepository<SavedTourGuideDto>, TouristFavoritesRepository>();

            services.AddScoped<ITourRepository, TourRepository>();
            services.AddScoped<IPlaceRepository<Place>, PlaceRepository<Place>>();
            services.AddScoped<PlacesSeeder>();

            return services;
        }


    }
}
