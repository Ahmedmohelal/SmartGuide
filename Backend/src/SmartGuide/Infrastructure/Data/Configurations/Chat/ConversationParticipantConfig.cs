using Domain.Entities.Chat;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Chat
{
    public class ConversationParticipantConfig : IEntityTypeConfiguration<ConversationParticipant>
    {
        public void Configure(EntityTypeBuilder<ConversationParticipant> builder)
        {
            builder.ToTable("ChatConversationParticipants");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.UserId).HasMaxLength(450).IsRequired();
            builder.Property(e => e.Role)
                .HasConversion<string>()
                .HasMaxLength(32)
                .IsRequired();

            builder.HasIndex(e => new { e.ConversationId, e.UserId })
                .IsUnique()
                .HasDatabaseName("UX_ChatConversationParticipants_Conversation_User_NotDeleted")
                .HasFilter("[IsDeleted] = 0");

            builder.HasIndex(e => e.UserId).HasDatabaseName("IX_ChatConversationParticipants_UserId");
        }
    }
}
