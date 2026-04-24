namespace Application.DTOs.AuthenticationDTOs
{
    public sealed record GoogleTokenValidationResult
    {
        public bool IsSuccess { get; init; }
        public GoogleUserInfoDto? UserInfo { get; init; }
        public string? ErrorMessage { get; init; }

        public static GoogleTokenValidationResult Success(GoogleUserInfoDto userInfo) =>
            new() { IsSuccess = true, UserInfo = userInfo };

        public static GoogleTokenValidationResult Failure(string message) =>
            new() { IsSuccess = false, ErrorMessage = message };
    }
}
