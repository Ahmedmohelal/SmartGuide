namespace Application.Services.Interfaces
{
    public interface IProfileInitializerService
    {
        Task EnsureProfileExistsAsync(string userId, string role, CancellationToken cancellationToken = default);
    }
}
