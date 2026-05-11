using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Entities.Enums
{
    public enum GuideAccountStatus
    {
        Pending = 0,
        Active = 1,
        Suspended = 2,
        Banned = 3,
        Rejected = 4,
        UnderReview = 5
    }
}

