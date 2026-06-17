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
        BookingConfirmed = 3,
        // Guide Verification
        GuideApproved = 4,
        GuideRejected = 5,

        // Payment
        PaymentSucceeded = 6,
        PaymentFailed = 7,
        // Admin Actions on Guide Account
        AccountSuspended = 8,
        AccountBanned = 9,
        AccountActivated = 10,
        AccountUnderReview = 11,

        // Admin Actions on Tours
        TourDeactivated = 12,
        TourActivated = 13,
        TourDeleted = 14,

        // Favorites
        GuideSaved = 15
    }
}
