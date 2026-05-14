using API.Extentions;
using API.Middleware;
using Application.Services.Interfaces;
using Application.Settings;
using Infrastructure.Data;
using Infrastructure.Hubs;
using Infrastructure.Services.Email;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    //options.AddPolicy("AllowFrontend", policy =>
    //{
    //    policy.WithOrigins(
    //        "http://localhost:5174",
    //            "http://127.0.0.1:5500",
    //            "http://localhost:5500")
    //          .AllowAnyMethod()
    //          .AllowAnyHeader()
    //          .AllowCredentials();
    //});
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


//add Application , Infrastructure registration
builder.Services.InfrastructureConfiguration(builder.Configuration);
builder.Services.ApplicationConfiguration(builder.Configuration);




builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();



await app.MigrateDataBaseAsync();
await app.SeedPlacesDataAsync();
await app.SeedRolesDataAsync();
await app.SeedAdminDataAsync();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowFrontend");
app.Use(async (context, next) =>
{
    if (context.Request.Path.StartsWithSegments("/api/payments/webhook"))
    {
        context.Request.EnableBuffering();
    }

    await next();
});
app.UseAuthentication();
app.UseMiddleware<GuideAccessGuardMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");

app.Run();
