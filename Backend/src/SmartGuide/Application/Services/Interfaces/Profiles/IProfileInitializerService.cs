namespace Application.Services.Interfaces.Profiles
{
    public interface IProfileInitializerService
    {
        Task EnsureProfileExistsAsync(string userId, string role, CancellationToken cancellationToken = default);
    }
}
