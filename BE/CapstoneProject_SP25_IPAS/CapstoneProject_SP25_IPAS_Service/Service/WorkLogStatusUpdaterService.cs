﻿using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
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
    private readonly TimeSpan _interval;
    private readonly IConfiguration _configuration;

    public WorkLogStatusUpdaterService(IServiceScopeFactory scopeFactory, ILogger<WorkLogStatusUpdaterService> logger, IConfiguration configuration)
    {
        _configuration = configuration;
        _scopeFactory = scopeFactory;
        _logger = logger;
        int hours = _configuration.GetValue<int>("WorkerService:WorkLogStatusUpdaterService", 24);
        _interval = TimeSpan.FromHours(hours);
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
                    Console.WriteLine("Test");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating WorkLog statuses.");
            }

             await Task.Delay(_interval, stoppingToken); // Kiểm tra mỗi phút
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
                if (workLog.ActualStartTime <= now.TimeOfDay && now.TimeOfDay < workLog.ActualEndTime)
                {
                    workLog.Status = WorkLogStatusConst.IN_PROGRESS;
                }
                else if (workLog.ActualEndTime < now.TimeOfDay)
                {
                    workLog.Status = WorkLogStatusConst.OVERDUE;
                }
            }

            await dbContext.SaveChangesAsync();
            _logger.LogInformation($"Updated {workLogsToUpdate.Count} WorkLogs statuses.");
        }
    }

}
