namespace Application.DTOs.AuthenticationDTOs
{
    public record AuthResponseDto(
        string AccessToken,
        string RefreshToken,
        DateTime ExpiresOn,
        DateTime RefreshTokenExpiresOn);
}
