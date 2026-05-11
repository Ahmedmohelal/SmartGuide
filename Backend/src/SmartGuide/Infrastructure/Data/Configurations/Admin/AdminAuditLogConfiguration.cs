using System;
using System.Collections.Generic;
using System.Text;

using Domain.Entities.Admin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.Admin
{
    internal sealed class AdminAuditLogConfiguration : IEntityTypeConfiguration<AdminAuditLog>
    {
        public void Configure(EntityTypeBuilder<AdminAuditLog> builder)
        {
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Action).HasMaxLength(120);
            builder.Property(x => x.EntityType).HasMaxLength(120);
            builder.Property(x => x.EntityId).HasMaxLength(120);
            builder.Property(x => x.IpAddress).HasMaxLength(60);
            builder.HasIndex(x => x.AdminId);
            builder.HasIndex(x => x.EntityType);
            builder.HasIndex(x => x.CreatedAtUtc);
        }
    }
}

