using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.Services.Interfaces.Admin;
using Domain.Entities.Wallet;
using Infrastructure.Data;
using Infrastructure.Data.Entities.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services.Admin
{
    public class GuideWalletAdminService : IGuideWalletAdminService
    {
        private readonly ApplicationDbContext _context;
        private readonly IAdminAuditService _auditService;
        private readonly UserManager<ApplicationUser> _userManager;

        public GuideWalletAdminService(
            ApplicationDbContext context,
            IAdminAuditService auditService,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _auditService = auditService;
            _userManager = userManager;
        }

        public async Task<GuideWalletDto?> GetWalletAsync(string guideId)
        {
            var wallet = await EnsureWalletAsync(guideId);

            if (wallet is null)
            {
                return null;
            }

            await _context.SaveChangesAsync();

            return new GuideWalletDto
            {
                WalletId = wallet.Id,
                GuideId = wallet.GuideId,
                Balance = wallet.Balance,
                IsFrozen = wallet.IsFrozen,
                UpdatedAtUtc = wallet.UpdatedAtUtc
            };
        }

        public async Task<List<GuideWalletTransactionDto>> GetTransactionsAsync(
            string guideId,
            int take = 100)
        {
            take = Math.Clamp(take, 1, 500);

            return await _context.GuideWalletTransactions
                .AsNoTracking()
                .Where(x => x.GuideId == guideId)
                .OrderByDescending(x => x.CreatedAtUtc)
                .Take(take)
                .Select(x => new GuideWalletTransactionDto
                {
                    Id = x.Id,
                    GuideId = x.GuideId,
                    Type = x.Type.ToString(),
                    Status = x.Status.ToString(),
                    Amount = x.Amount,
                    BalanceBefore = x.BalanceBefore,
                    BalanceAfter = x.BalanceAfter,
                    ReferenceId = x.ReferenceId,
                    Notes = x.Notes,
                    AdminId = x.AdminId,
                    CreatedAtUtc = x.CreatedAtUtc
                })
                .ToListAsync();
        }

        public async Task<OperationResultDto> AddBalanceAsync(
            string guideId,
            string adminId,
            GuideWalletAdjustmentDto dto,
            string? ipAddress)
        {
            return await AdjustBalanceAsync(
                guideId,
                adminId,
                dto,
                WalletTransactionType.Deposit,
                ipAddress);
        }

        public async Task<OperationResultDto> DeductBalanceAsync(
            string guideId,
            string adminId,
            GuideWalletAdjustmentDto dto,
            string? ipAddress)
        {
            return await AdjustBalanceAsync(
                guideId,
                adminId,
                dto,
                WalletTransactionType.AdminAdjustment,
                ipAddress,
                isDebit: true);
        }

        public async Task<OperationResultDto> SetFreezeStateAsync(
            string guideId,
            bool freeze,
            string adminId,
            string reason,
            string? ipAddress)
        {
            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction =
                    await _context.Database.BeginTransactionAsync();

                try
                {
                    var wallet = await EnsureWalletAsync(guideId);

                    if (wallet is null)
                    {
                        return new OperationResultDto
                        {
                            IsSuccess = false,
                            Message = "Guide not found."
                        };
                    }

                    wallet.IsFrozen = freeze;
                    wallet.UpdatedAtUtc = DateTime.UtcNow;

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    await _auditService.WriteAsync(
                        adminId,
                        freeze
                            ? "FreezeGuideWallet"
                            : "UnfreezeGuideWallet",
                        "GuideWallet",
                        wallet.Id.ToString(),
                        reason,
                        ipAddress);

                    return new OperationResultDto
                    {
                        IsSuccess = true,
                        Message = freeze
                            ? "Wallet frozen successfully."
                            : "Wallet unfrozen successfully."
                    };
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private async Task<OperationResultDto> AdjustBalanceAsync(
            string guideId,
            string adminId,
            GuideWalletAdjustmentDto dto,
            WalletTransactionType type,
            string? ipAddress,
            bool isDebit = false)
        {
            if (dto.Amount <= 0)
            {
                return new OperationResultDto
                {
                    IsSuccess = false,
                    Message = "Amount must be greater than zero."
                };
            }

            var strategy = _context.Database.CreateExecutionStrategy();

            return await strategy.ExecuteAsync(async () =>
            {
                await using var transaction =
                    await _context.Database.BeginTransactionAsync();

                try
                {
                    var wallet = await EnsureWalletAsync(guideId);

                    if (wallet is null)
                    {
                        return new OperationResultDto
                        {
                            IsSuccess = false,
                            Message = "Guide not found."
                        };
                    }

                    if (wallet.IsFrozen)
                    {
                        return new OperationResultDto
                        {
                            IsSuccess = false,
                            Message = "Wallet is frozen."
                        };
                    }

                    var before = wallet.Balance;

                    var delta = isDebit
                        ? -dto.Amount
                        : dto.Amount;

                    var after = before + delta;

                    if (after < 0)
                    {
                        return new OperationResultDto
                        {
                            IsSuccess = false,
                            Message = "Insufficient balance."
                        };
                    }

                    wallet.Balance = after;
                    wallet.UpdatedAtUtc = DateTime.UtcNow;

                    var walletTransaction = new GuideWalletTransaction
                    {
                        Id = Guid.NewGuid(),
                        WalletId = wallet.Id,
                        GuideId = guideId,
                        Type = type,
                        Status = WalletTransactionStatus.Completed,
                        Amount = dto.Amount,
                        BalanceBefore = before,
                        BalanceAfter = after,
                        Notes = dto.Notes,
                        AdminId = adminId
                    };

                    await _context.GuideWalletTransactions
                        .AddAsync(walletTransaction);

                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    await _auditService.WriteAsync(
                        adminId,
                        isDebit
                            ? "DeductGuideBalance"
                            : "AddGuideBalance",
                        "GuideWallet",
                        wallet.Id.ToString(),
                        dto.Notes,
                        ipAddress);

                    return new OperationResultDto
                    {
                        IsSuccess = true,
                        Message = "Wallet updated successfully."
                    };
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });
        }

        private async Task<GuideWallet?> EnsureWalletAsync(string guideId)
        {
            var guide = await _userManager.FindByIdAsync(guideId);

            if (guide is null)
            {
                return null;
            }

            var isGuide = await _userManager.IsInRoleAsync(
                guide,
                "TourGuide");

            if (!isGuide)
            {
                return null;
            }

            var wallet = await _context.GuideWallets
                .FirstOrDefaultAsync(x => x.GuideId == guideId);

            if (wallet is not null)
            {
                return wallet;
            }

            wallet = new GuideWallet
            {
                Id = Guid.NewGuid(),
                GuideId = guideId,
                Balance = 0m,
                IsFrozen = false,
                UpdatedAtUtc = DateTime.UtcNow
            };

            await _context.GuideWallets.AddAsync(wallet);

            return wallet;
        }
    }
}