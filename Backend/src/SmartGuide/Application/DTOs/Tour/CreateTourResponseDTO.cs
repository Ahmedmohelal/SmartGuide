using System;
using System.Collections.Generic;
using System.Text;

namespace Application.DTOs.Tour
{
    public class CreateTourResponseDTO
    {
        public bool IsSucceded { get; set; }

        public string message { get; set; } = string.Empty;

        public Guid Id { get; set; }

        public string  Title { get; set; }

        public decimal Price { get; set; }

    }
}
