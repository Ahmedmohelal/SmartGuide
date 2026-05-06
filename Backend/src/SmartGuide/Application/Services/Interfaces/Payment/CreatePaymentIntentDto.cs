using System.ComponentModel.DataAnnotations;

namespace Application.Services.Interfaces.Payment
{
    public class CreatePaymentIntentDto
    {
        [Required]
        public Guid BookingId { get; set; }
    }
}
