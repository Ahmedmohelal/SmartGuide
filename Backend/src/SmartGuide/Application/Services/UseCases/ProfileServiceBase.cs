using Application.Services.Interfaces;
using Domain.Interfaces;

namespace Application.Services.UseCases
{
    public abstract class ProfileServiceBase<TProfileDto, TUpdateDto> : IProfileService<TProfileDto, TUpdateDto>
    {
        private readonly IProfileRepository<TProfileDto, TUpdateDto> _repository;

        protected ProfileServiceBase(IProfileRepository<TProfileDto, TUpdateDto> repository)
        {
            _repository = repository;
        }

        public Task<IReadOnlyList<TProfileDto>> GetAllProfilesAsync()
        {
            return _repository.GetAllAsync();
        }

        public Task<TProfileDto?> GetProfileByIdAsync(string userId)
        {
            return _repository.GetByIdAsync(userId);
        }

        public Task<TProfileDto?> UpdateProfileAsync(string userId, TUpdateDto model)
        {
            return _repository.UpdateAsync(userId, model);
        }
    }
}
