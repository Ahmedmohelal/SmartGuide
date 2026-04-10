using Application.DTOs;

public sealed record RefreshTokenValidationResult
{
    public bool IsValid { get; init; }
    public User? User { get; init; }
    public string? NewPlainToken { get; init; }
    public DateTime? NewTokenExpiresAt { get; init; }
    public string ErrorCode { get; init; } = string.Empty;
    public string ErrorMessage { get; init; } = string.Empty;

    public static RefreshTokenValidationResult Success(User user, string newPlainToken, DateTime newTokenExpiresAt) =>
        new() { IsValid = true, User = user, NewPlainToken = newPlainToken, NewTokenExpiresAt = newTokenExpiresAt };

    public static RefreshTokenValidationResult Failure(string errorCode, string errorMessage) =>
        new() { IsValid = false, ErrorCode = errorCode, ErrorMessage = errorMessage };
}