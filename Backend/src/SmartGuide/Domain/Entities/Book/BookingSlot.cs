using System;
using Domain.Entities.Tours;

namespace Domain.Entities.Book
{
    public class BookingSlot
    {
        public Guid Id { get; set; }

        public string GuideId { get; set; } = null!;

        public Guid TourId { get; set; }
        public Tour Tour { get; set; } = null!;

        public DateOnly Date { get; set; }

        public TimeOnly StartTime { get; set; }
        public TimeOnly EndTime { get; set; }

        public int Capacity { get; set; }      
        public int BookedCount { get; set; }
      

    }
}
