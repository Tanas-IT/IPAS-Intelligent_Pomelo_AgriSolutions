using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
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

            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Kiểm tra mỗi phút
        }
    }

    private async Task UpdateWorkLogStatuses(IpasContext dbContext)
    {
        var now = DateTime.UtcNow;

        var workLogsToUpdate = await dbContext.WorkLogs
            .Where(wl => wl.Status != "In Progress" && wl.Date == now.Date && wl.ActualStartTime <= now.TimeOfDay)
            .ToListAsync();

        if (workLogsToUpdate.Any())
        {
            foreach (var workLog in workLogsToUpdate)
            {
                workLog.Status = "In Progress";
            }

            await dbContext.SaveChangesAsync();
            _logger.LogInformation($"Updated {workLogsToUpdate.Count} WorkLogs to 'In Progress'.");
        }
    }
}
