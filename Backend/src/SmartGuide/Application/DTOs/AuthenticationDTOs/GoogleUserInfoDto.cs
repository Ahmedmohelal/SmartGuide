namespace Application.DTOs.AuthenticationDTOs
{
    public record GoogleUserInfoDto(
        string GoogleUserId,
        string Email,
        string? Name,
        bool EmailVerified,
        string country     

        );
}
