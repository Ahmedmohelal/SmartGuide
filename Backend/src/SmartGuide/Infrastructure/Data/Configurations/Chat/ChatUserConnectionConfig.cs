using Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Chat
{
    public class ChatUserConnectionConfig : IEntityTypeConfiguration<ChatUserConnection>
    {
        public void Configure(EntityTypeBuilder<ChatUserConnection> builder)
        {
            builder.ToTable("ChatUserConnections");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.UserId).HasMaxLength(450).IsRequired();
            builder.Property(e => e.ConnectionId).HasMaxLength(128).IsRequired();

            builder.HasIndex(e => e.ConnectionId)
                .IsUnique()
                .HasDatabaseName("UX_ChatUserConnections_ConnectionId");

            builder.HasIndex(e => e.UserId).HasDatabaseName("IX_ChatUserConnections_UserId");
        }
    }
}
