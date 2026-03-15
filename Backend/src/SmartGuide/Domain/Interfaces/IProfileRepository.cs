namespace Domain.Interfaces
{
    public interface IProfileRepository<TProfileDto, in TUpdateDto>
    {
        Task<TProfileDto?> GetByIdAsync(string userId);
        Task<TProfileDto?> UpdateAsync(string userId, TUpdateDto model);
    }
}
