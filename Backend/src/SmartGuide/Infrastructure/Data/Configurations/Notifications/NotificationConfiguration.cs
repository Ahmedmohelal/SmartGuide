using Domain.Entities.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Notifications
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.ToTable("Notifications");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.Title)
                .HasMaxLength(200)
                .IsRequired();

            builder.Property(x => x.Message)
                .HasMaxLength(1000)
                .IsRequired();

            builder.Property(x => x.NotificationType)
                .HasConversion<string>()
                .HasMaxLength(50)
                .IsRequired();

            builder.Property(x => x.ReferenceId)
                .HasMaxLength(100);

            builder.Property(x => x.ReferenceType)
                .HasMaxLength(50);

            builder.HasIndex(x => new { x.UserId, x.IsRead });
            builder.HasIndex(x => new { x.UserId, x.CreatedAt });
        }
    }
}
