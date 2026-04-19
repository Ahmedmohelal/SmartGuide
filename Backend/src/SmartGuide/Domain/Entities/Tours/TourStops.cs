using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities.Tours
{
    public class TourStops
    {
        public Guid Id { get; private set; }
        public Guid TourId { get; private set; }
        public int OrderIndex { get; private set; }

        [MaxLength(200)]
        public string Title { get; private set; }

        [MaxLength(500)]
        public string Description { get; private set; }

        public Tour Tour { get; private set; }

        public TourStops(Guid tourId, int orderIndex, string title, string description)
        {
            Id = Guid.NewGuid();
            TourId = tourId;
            OrderIndex = orderIndex;
            Title = title;
            Description = description;
        }



    }
}