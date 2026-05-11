using Domain.Entities.Wallet;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Infrastructure.Data.Configurations.Wallet
{
    internal sealed class GuideWalletConfiguration : IEntityTypeConfiguration<GuideWallet>
    {
        public void Configure(EntityTypeBuilder<GuideWallet> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Balance).HasColumnType("decimal(18,2)");
            builder.Property(x => x.RowVersion).IsRowVersion();
            builder.HasIndex(x => x.GuideId).IsUnique();
            builder.HasCheckConstraint("CK_GuideWallet_Balance_NonNegative", "[Balance] >= 0");
        }
    }
}
