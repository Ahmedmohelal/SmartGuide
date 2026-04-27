using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Book
{
    public class GuideAvailability
    {
        public Guid Id { get; set; }

        public string GuideId { get; set; }

        public DateOnly Date { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public bool IsActive { get; set; } = true;

    }
}
