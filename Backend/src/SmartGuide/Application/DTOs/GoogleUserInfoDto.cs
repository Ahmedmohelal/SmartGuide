namespace Application.DTOs
{
    public record GoogleUserInfoDto(
        string GoogleUserId,
        string Email,
        string? Name,
        bool EmailVerified);
}
