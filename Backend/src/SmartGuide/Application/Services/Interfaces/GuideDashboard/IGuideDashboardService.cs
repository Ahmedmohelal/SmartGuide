using Application.DTOs.AdminDashboard;
using Application.DTOs.AuthenticationDTOs;
using Application.DTOs.GuideDashboard;
using Application.DTOs.Tour;

namespace Application.Services.Interfaces.GuideDashboard
{
    public interface IGuideDashboardService
    {
        Task<GuideDashboardResponseDto> GetDashboardAsync(string guideId, int months = 6, int topTours = 5);
        Task<GuideDashboardStatisticsDto> GetStatisticsAsync(string guideId);
        Task<List<GuideMonthlyEarningsPointDto>> GetEarningsTimelineAsync(string guideId, int months = 12);
        Task<List<GuideMonthlyBookingsPointDto>> GetBookingsTimelineAsync(string guideId, int months = 12);
        Task<List<GuideTourPerformanceDto>> GetTourPerformanceAsync(string guideId, int take = 10, bool mostPopular = true);
        Task<GuideWalletDto> GetWalletAsync(string guideId);
        Task<List<GuideWalletTransactionDto>> GetWalletTransactionsAsync(string guideId, int take = 100);
        Task<List<GuideRecentActivityDto>> GetRecentActivitiesAsync(string guideId, int take = 20);

        
    }
}
