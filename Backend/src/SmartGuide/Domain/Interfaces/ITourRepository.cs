using Domain.Entities.Tours;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Interfaces
{
    public interface ITourRepository
    {
        public Task<List<Tour>> GetGuideToursAsync(string guideId);



    }
}
