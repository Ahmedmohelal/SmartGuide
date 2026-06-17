namespace Domain.Entities.Book
{
    public enum PaymentConfirmationResult
    {
        NewlyConfirmed,
        AlreadyConfirmed,
        SlotFull,
        Failed
    }
}
