using Domain.Entities.Wallet;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Wallet
{
    internal sealed class GuideWalletTransactionConfiguration : IEntityTypeConfiguration<GuideWalletTransaction>
    {
        public void Configure(EntityTypeBuilder<GuideWalletTransaction> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Amount).HasColumnType("decimal(18,2)");
            builder.Property(x => x.BalanceBefore).HasColumnType("decimal(18,2)");
            builder.Property(x => x.BalanceAfter).HasColumnType("decimal(18,2)");
            builder.HasIndex(x => x.GuideId);
            builder.HasIndex(x => x.WalletId);
            builder.HasIndex(x => x.CreatedAtUtc);
        }
    }
}
