using Application.DTOs.ProfileDTOs;
using Application.DTOs.Saved;
using Application.DTOs.SavedPlaces;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.Chat;
using Application.Services.Interfaces.GuideDashboard;
using Application.Services.Interfaces.Payment;
using Application.Services.Interfaces.PictureMaker;
using Application.Services.Interfaces.Profiles;
using Application.Services.Interfaces.Tour;
using Application.Services.Interfaces.GuideDashboard;
using Domain.Entities.Home;
using Domain.Interfaces;
using Domain.Interfaces.Chat;
using Infrastructure.Chat;
using Infrastructure.Data;
using Infrastructure.Data.DbSeeder;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Repository.Book;
using Infrastructure.Repository.Chat;
using Infrastructure.Repository.Home;
using Infrastructure.Repository.Profile;
using Infrastructure.Repository.Tours;
using Infrastructure.Services.Admin;
using Infrastructure.Services.Auth;
using Infrastructure.Services.Chat;
using Infrastructure.Services.Email;
using Infrastructure.Services.Files;
using Infrastructure.Services.GuideDashboard;
using Infrastructure.Services.Identity;
using Infrastructure.Services.Payment;
using Infrastructure.Services.Token;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Infrastructure.Settings
{
    public static class InfrastructureRegistration
    {
        public static IServiceCollection InfrastructureConfiguration(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("MainConnection"),
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
               {
                   op.TokenValidationParameters = new TokenValidationParameters
                   {
                       ValidateIssuer = true,
                       ValidateAudience = true,
                       ValidateIssuerSigningKey = true,
                       ValidateLifetime = true,
                       ValidIssuer = JWT["Issuer"],
                       ValidAudience = JWT["Audience"],
                       IssuerSigningKey = new SymmetricSecurityKey(
                           Encoding.UTF8.GetBytes(JWT["Key"]!)),
                       ClockSkew = TimeSpan.Zero
                   };

                   op.Events = new JwtBearerEvents
                   {
                       OnMessageReceived = context =>
                       {
                           var accessToken = context.Request.Query["access_token"];

                           var path = context.HttpContext.Request.Path;

                           if (!string.IsNullOrEmpty(accessToken)
                               && path.StartsWithSegments("/hubs/chat"))
                           {
                               context.Token = accessToken;
                           }

                           return Task.CompletedTask;
                       }
                   };
               });

            //Repositories 
            services.AddScoped<ITourRepository, TourRepository>();
            services.AddScoped<IProfileRepository<TourGuideProfileDto, UpdateTourGuideProfileDto>, TourGuideProfileRepository>();
            services.AddScoped<IProfileRepository<TouristProfileDto, UpdateTouristProfileDto>, TouristProfileRepository>();
            services.AddScoped<ITouristFavoritesRepository<SavedTourGuideDto>, TouristFavoritesRepository>();
            services.AddScoped<IBookingRepository, BookingRepository>();
            services.AddScoped<ITouristFavoritesRepository<SavedTourGuideDto>, TouristFavoritesRepository>();
            services.AddScoped<IPlaceRepository<Place>, PlaceRepository<Place>>();

            //Services
            services.Configure<GoogleAuthOptions>(configuration.GetSection(GoogleAuthOptions.SectionName));
            services.Configure<EmailSettings>(configuration.GetSection(EmailSettings.SectionName));
            services.Configure<StripeSettings>(configuration.GetSection(StripeSettings.SectionName));

            services.AddHttpContextAccessor();
            services.AddScoped<IImageUrlService, ImageUrlService>();

            services.AddScoped<IUserService, UserServiceAdapter>();
            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IRefreshTokenService, RefreshTokenService>();
            services.AddScoped<IGoogleAuthService, GoogleAuthService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IProfileInitializerService, ProfileInitializerService>();
            services.AddScoped<IPaymentService, PaymentService>();

            services.AddScoped<IAdminDashboardService, AdminDashboardService>();
            services.AddScoped<IAdminAuditService, AdminAuditService>();
            services.AddScoped<IUserAdminService, UserAdminService>();
            services.AddScoped<IGuideAdminService, GuideAdminService>();
            services.AddScoped<IGuideWalletAdminService, GuideWalletAdminService>();
            services.AddScoped<ITourAdminService, TourAdminService>();
            services.AddScoped<IBookingAdminService, BookingAdminService>();
            services.AddScoped<IGuideDashboardService, GuideDashboardService>();


            //seeders
            services.AddScoped<PlacesSeeder>();
            services.AddScoped<ISavedPlacesRepository<SavedPlaceDto>, SavedPlacesRepository>();

            services.AddScoped<IdentitySeeder>();
            services.AddScoped<RoleSeeder>();


            services.AddScoped<IChatConversationRepository, ChatConversationRepository>();
            services.AddScoped<IChatMessageRepository, ChatMessageRepository>();
            services.AddScoped<IChatUserConnectionRepository, ChatUserConnectionRepository>();
            services.AddScoped<IChatUnitOfWork, ChatUnitOfWork>();
            services.AddScoped<IChatRealtimePublisher, ChatSignalRPublisher>();
            services.AddScoped<IChatUserReader, ChatUserReader>();
            services.AddSignalR();
            services.AddSingleton<IUserIdProvider, NameIdentifierUserIdProvider>();

            return services;
        }


    }
}
