namespace Application.DTOs
{
    public sealed record AuthRefreshResult
    {
        public bool IsSuccess { get; init; }
        public AuthDto? Auth { get; init; }
        public string ErrorCode { get; init; } = string.Empty;
        public string ErrorMessage { get; init; } = string.Empty;

        public static AuthRefreshResult Success(AuthDto auth) =>
            new() { IsSuccess = true, Auth = auth };

        public static AuthRefreshResult Failure(string errorCode, string errorMessage) =>
            new() { IsSuccess = false, ErrorCode = errorCode, ErrorMessage = errorMessage };
    }
}
