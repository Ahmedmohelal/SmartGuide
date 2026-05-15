using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Notifications
{
    public enum NotificationType
    {
        // Booking Notifications
        BookingCreated = 1,
        BookingCancelled = 2,

        // Guide Verification
        GuideApproved = 3,
        GuideRejected = 4,

        // Payment
        PaymentSucceeded = 5,
        PaymentFailed = 6,

        // Admin Actions on Guide Account
        AccountSuspended = 7,
        AccountBanned = 8,
        AccountActivated = 9,
        AccountUnderReview = 10,

        // Admin Actions on Tours
        TourDeactivated = 11,
        TourActivated = 12,

        // Favorites
        GuideSaved = 13
    }
}
