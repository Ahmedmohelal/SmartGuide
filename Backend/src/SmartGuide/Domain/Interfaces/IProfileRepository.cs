namespace Domain.Interfaces
{
    public interface IProfileRepository<TProfileDto, in TUpdateDto>
    {
        Task<IReadOnlyList<TProfileDto>> GetAllAsync();
        Task<TProfileDto?> GetByIdAsync(string userId);
        Task<TProfileDto?> UpdateAsync(string userId, TUpdateDto model);
    }
}
