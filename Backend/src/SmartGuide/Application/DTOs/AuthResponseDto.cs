namespace Application.DTOs
{
    public record AuthResponseDto(
        string AccessToken,
        string RefreshToken,
        DateTime ExpiresOn,
        DateTime RefreshTokenExpiresOn);
}
