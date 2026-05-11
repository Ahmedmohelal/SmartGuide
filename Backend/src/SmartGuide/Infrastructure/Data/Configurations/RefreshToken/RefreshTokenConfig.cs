using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Infrastructure.Data.Configurations.RefreshTokens
{
    public class RefreshTokenConfig : IEntityTypeConfiguration<Infrastructure.Data.Entities.RefreshToken>
    {
        public void Configure(EntityTypeBuilder<Infrastructure.Data.Entities.RefreshToken> builder)
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
