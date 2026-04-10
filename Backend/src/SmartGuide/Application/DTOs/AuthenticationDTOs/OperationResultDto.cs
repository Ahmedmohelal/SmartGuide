namespace Application.DTOs.AuthenticationDTOs
{
    public class OperationResultDto
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
