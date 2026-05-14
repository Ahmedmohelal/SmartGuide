using Domain.Entities.Chat;
using Infrastructure.Data.Entities.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Chat
{
    public class ConversationConfig : IEntityTypeConfiguration<Conversation>
    {
        public void Configure(EntityTypeBuilder<Conversation> builder)
        {
            builder.ToTable("ChatConversations");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.TouristUserId).HasMaxLength(450).IsRequired();
            builder.Property(e => e.GuideUserId).HasMaxLength(450).IsRequired();
            builder.Property(e => e.MessagingBlockedByGuideUserId).HasMaxLength(450);

            builder.Property(e => e.LastMessagePreview).HasMaxLength(512);

            builder.HasIndex(e => new { e.TouristUserId, e.GuideUserId })
                .IsUnique()
                .HasDatabaseName("UX_ChatConversations_Tourist_Guide_NotDeleted")
                .HasFilter("[IsDeleted] = 0");

            builder.HasIndex(e => e.TouristUserId).HasDatabaseName("IX_ChatConversations_TouristUserId");
            builder.HasIndex(e => e.GuideUserId).HasDatabaseName("IX_ChatConversations_GuideUserId");
            builder.HasIndex(e => e.UpdatedAtUtc).HasDatabaseName("IX_ChatConversations_UpdatedAtUtc");

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(e => e.TouristUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(e => e.GuideUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Participants)
                .WithOne(p => p.Conversation)
                .HasForeignKey(p => p.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(e => e.Messages)
                .WithOne(m => m.Conversation)
                .HasForeignKey(m => m.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
