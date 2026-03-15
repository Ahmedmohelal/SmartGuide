namespace Application.Services.Interfaces
{
    public interface IProfileService<TProfileDto, in TUpdateDto>
    {
        Task<TProfileDto?> GetProfileByIdAsync(string userId);
        Task<TProfileDto?> UpdateProfileAsync(string userId, TUpdateDto model);
    }
}
