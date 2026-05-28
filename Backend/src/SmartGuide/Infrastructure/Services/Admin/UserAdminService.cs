using Application.Common.Pagination;
using Application.DTOs;
using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.Home;
using Application.Helper;
using Application.Services.Interfaces.Admin;
using Application.Services.Interfaces.Auth;
using Application.Services.Interfaces.PictureMaker;
using Application.Services.UseCases.PictureMaker;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
using Infrastructure.Services.Admin.Specs;
using Infrastructure.Services.Home;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using OperationResultDto = Application.DTOs.AuthenticationDTOs.OperationResultDto;


namespace Infrastructure.Services.Admin
{
    public class UserAdminService : IUserAdminService
    {


        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IImageUrlService _imageUrlService;
        private readonly IAttachmentService _attachmentService;
        private readonly ILogger<UserAdminService> _logger;


        public UserAdminService(
            ApplicationDbContext context,
            IImageUrlService imageUrlService
,
            UserManager<ApplicationUser> userManager,
            IAttachmentService attachmentService,
            ILogger<UserAdminService> logger)
        {
            _context = context;
            _imageUrlService = imageUrlService;
            _userManager = userManager;
            _attachmentService = attachmentService;
            _logger = logger;
        }
        public async Task<Pagination<AdminUserDto>>
    GetAllUsersAsync(
        AdminUserSpecParams specParams)
        {
            var spec =
                new AdminUsersSpecification(specParams);

            var countSpec =
                new AdminUsersCountSpecification(
                    specParams);

            var usersQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users.AsQueryable(),
                        spec);

            var countQuery =
                SpecificationEvaluator<ApplicationUser>
                    .GetQuery(
                        _context.Users.AsQueryable(),
                        countSpec);

            var users = await usersQuery

                .AsNoTracking()

                .ToListAsync();

            var count = await countQuery
                .CountAsync();

            var mappedUsers = users
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,

                    FirstName = u.FirstName,

                    LastName = u.LastName,

                    Email = u.Email ?? string.Empty,

                    UserName = u.UserName ?? string.Empty,

                    Country = u.Country,

                    Role = u.Role,

                    WhatsAppNumber =
                        u.WhatsAppNumber,

                    ProfileImage =
                        _imageUrlService
                            .ToPublicImageUrl(
                                u.ProfileImage,
                                "profileImages"),

                    GuideLicenseImage =
                        _imageUrlService
                            .ToPublicImageUrl(
                                u.GuideLicenseImage,
                                "licenses"),

                    NationalIdImage =
                        _imageUrlService
                            .ToPublicImageUrl(
                                u.NationalIdImage,
                                "nationalIds"),

                    VerificationStatus =
                        u.IsGuideVerified.ToString(),

                    IsActive =
                        !u.LockoutEnd.HasValue
                        || u.LockoutEnd
                            < DateTimeOffset.UtcNow

                }).ToList();

            return new Pagination<AdminUserDto>(
                specParams.PageIndex,
                specParams.PageSize,
                count,
                mappedUsers);
        }

        public async Task<AdminUserDto?> GetUserByIdAsync(string userId)
        {
            var u = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (u == null) return null;

            return new AdminUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email ?? string.Empty,
                UserName = u.UserName ?? string.Empty,
                Country = u.Country,
                Role = u.Role,
                WhatsAppNumber = u.WhatsAppNumber,
                ProfileImage = _imageUrlService.ToPublicImageUrl(u.ProfileImage, "profileImages"),
                GuideLicenseImage = _imageUrlService.ToPublicImageUrl(u.GuideLicenseImage, "licenses"),
                NationalIdImage = _imageUrlService.ToPublicImageUrl(u.NationalIdImage, "nationalIds"),
                VerificationStatus = u.IsGuideVerified.ToString(),
                IsActive = !u.LockoutEnd.HasValue || u.LockoutEnd < DateTimeOffset.UtcNow
            };
        }

        public async Task<OperationResultDto> DeactivateUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "User not found." };

            user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);
            user.LockoutEnabled = true;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "User deactivated successfully." };
        }

        public async Task<OperationResultDto> ActivateUserAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                return new OperationResultDto { IsSuccess = false, Message = "User not found." };

            user.LockoutEnd = null;
            user.LockoutEnabled = false;
            await _context.SaveChangesAsync();

            return new OperationResultDto { IsSuccess = true, Message = "User activated successfully." };
        }

        public async Task<OperationResultDto> DeleteUserAsync(string userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(x => x.Id == userId);

            if (user == null)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "User not found."
                };
            }

            bool hasTours = await _context.Tours
                .AnyAsync(x => x.GuideId == userId);

            if (hasTours)
            {
                user.LockoutEnabled = true;
                user.LockoutEnd = DateTimeOffset.UtcNow.AddYears(100);

                await _context.SaveChangesAsync();

                return new OperationResultDto
                {
                    IsSuccess = true,
                    Message = "User has related data, so account was deactivated instead of deleted."
                };
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "User deleted successfully."
            };
        }

        public async Task<OperationResultDto> CreateAdminAsync(CreateAdminDto createAdminDto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == createAdminDto.Email))
            {
                return new OperationResultDto { IsSuccess = false, Message = "Email already in use." };
            }

            var profileImage = string.Empty;

            if (createAdminDto.ProfilePicture is not null)
            {
                try
                {
                    profileImage = await _attachmentService.Upload("profileImages", createAdminDto.ProfilePicture);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to upload profile image for {Email}.", createAdminDto.Email);

                    await DeleteProfileImage(profileImage);

                    return new OperationResultDto
                    {
                        IsSuccess = false,
                        Message = ErrorMessages.UploadFailed };
                }
            }

            var newAdmin = new ApplicationUser
            {
                Id = Guid.NewGuid().ToString(),
                FirstName = createAdminDto.FirstName,
                LastName = createAdminDto.LastName,
                Email = createAdminDto.Email,
                UserName = createAdminDto.Email,
                Country = createAdminDto.Country,
                Role = "Admin",
                EmailConfirmed = true,
                WhatsAppNumber = createAdminDto.WhatsAppNumber,
                ProfileImage = profileImage
            };
            var result = await _userManager.CreateAsync(newAdmin, createAdminDto.Password);

            if (!result.Succeeded)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = string.Join(", ", result.Errors.Select(e => e.Description))
                };
            }

            var roleResult = await _userManager.AddToRoleAsync(newAdmin, Roles.Admin);

            if (!roleResult.Succeeded)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "User created but failed to assign role"
                };
            }

            return new OperationResultDto
            {
                IsSuccess = true,
                Message = "Admin created successfully"
            };

        }
        private async Task DeleteProfileImage(string? profileImage)
        {
            
            if (profileImage != null)
                await _attachmentService.Delete(profileImage, "profileImages");
        }

    }
}
