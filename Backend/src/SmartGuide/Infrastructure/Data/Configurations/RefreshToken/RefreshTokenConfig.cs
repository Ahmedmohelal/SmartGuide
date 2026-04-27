using Infrastructure.Data.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;
using Refresh= Infrastructure.Data.Entities.RefreshToken;

namespace Infrastructure.Data.Configurations.RefreshToken
{
    public class RefreshTokenConfig : IEntityTypeConfiguration<Refresh>
    {
        public void Configure(EntityTypeBuilder<Refresh> builder)
        {
            builder.ToTable("RefreshTokens");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.TokenHash).HasMaxLength(64).IsRequired();
            builder.Property(e => e.UserId).IsRequired();
            builder.HasIndex(e => e.TokenHash);
            builder.HasIndex(e => e.UserId);

            builder.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
