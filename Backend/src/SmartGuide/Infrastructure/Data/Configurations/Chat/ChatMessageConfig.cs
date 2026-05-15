using Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Chat
{
    public class ChatMessageConfig : IEntityTypeConfiguration<ChatMessage>
    {
        public void Configure(EntityTypeBuilder<ChatMessage> builder)
        {
            builder.ToTable("ChatMessages");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.SenderUserId).HasMaxLength(450).IsRequired();
            builder.Property(e => e.Content).HasMaxLength(4000).IsRequired();

            builder.Property(e => e.Status)
                .HasConversion<int>()
                .IsRequired();

            builder.HasIndex(e => new { e.ConversationId, e.SentAtUtc })
                .HasDatabaseName("IX_ChatMessages_Conversation_SentAt");

            builder.HasIndex(e => e.SenderUserId).HasDatabaseName("IX_ChatMessages_SenderUserId");
        }
    }
}
