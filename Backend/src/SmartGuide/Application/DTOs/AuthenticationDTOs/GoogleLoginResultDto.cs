namespace Application.DTOs.AuthenticationDTOs
{
    public sealed record GoogleLoginResultDto
    {
        public bool IsSuccess { get; init; }
        public string? Message { get; init; }
        public AuthResponseDto? Auth { get; init; }

        public static GoogleLoginResultDto Success(AuthResponseDto auth) =>
            new() { IsSuccess = true, Auth = auth };

        public static GoogleLoginResultDto Failure(string message) =>
            new() { IsSuccess = false, Message = message };
    }
}
