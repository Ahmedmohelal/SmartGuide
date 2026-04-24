using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Tours
{
    public class TourAddOn
    {
        public Guid Id { get; set; }

        public Guid TourId { get; set; }

        public Tour Tour { get; set; }

        public string Title { get; set; }
        public decimal Price { get; set; }

        public bool IsActive { get; set; }

    }
}
