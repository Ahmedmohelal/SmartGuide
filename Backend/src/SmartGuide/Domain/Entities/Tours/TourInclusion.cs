using Domain.Entities.Tours.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Tours
{
    public class TourInclusion
    {
        public Guid Id { get; set; }

        public Guid TourId { get; set; }

        public  Tour Tour { get; set; }

        public string Description { get; set; }

        public InclusionType  Type { get; set; }
    }
}
