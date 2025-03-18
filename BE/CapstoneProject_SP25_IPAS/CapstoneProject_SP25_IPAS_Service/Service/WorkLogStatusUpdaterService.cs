using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

public class WorkLogStatusUpdaterService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WorkLogStatusUpdaterService> _logger;

    public WorkLogStatusUpdaterService(IServiceScopeFactory scopeFactory, ILogger<WorkLogStatusUpdaterService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WorkLogStatusUpdaterService is running.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var dbContext = scope.ServiceProvider.GetRequiredService<IpasContext>();
                    await UpdateWorkLogStatuses(dbContext);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating WorkLog statuses.");
            }

            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken); // Kiểm tra mỗi phút
        }
    }

    private async Task UpdateWorkLogStatuses(IpasContext dbContext)
    {
        var now = DateTime.UtcNow;

        var workLogsToUpdate = await dbContext.WorkLogs
            .Where(wl => wl.Date == now.Date) // Chỉ lấy WorkLogs của ngày hôm nay
            .ToListAsync();

        if (workLogsToUpdate.Any())
        {
            foreach (var workLog in workLogsToUpdate)
            {
                if (workLog.Status != WorkLogStatusConst.IN_PROGRESS && workLog.ActualStartTime <= now.TimeOfDay)
                {
                    workLog.Status = WorkLogStatusConst.IN_PROGRESS;
                }

                if (workLog.ActualEndTime < now.TimeOfDay)
                {
                    workLog.Status = WorkLogStatusConst.OVERDUE;
                }
            }

            await dbContext.SaveChangesAsync();
            _logger.LogInformation($"Updated {workLogsToUpdate.Count} WorkLogs statuses.");
        }
    }

}
