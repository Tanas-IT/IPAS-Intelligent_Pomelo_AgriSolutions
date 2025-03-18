using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Constants;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PlantGrowthUpdateService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<PlantGrowthUpdateService> _logger;

        public PlantGrowthUpdateService(IServiceScopeFactory scopeFactory, ILogger<PlantGrowthUpdateService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Plant growth is running.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await UpdatePlantStatuses();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating WorkLog statuses.");
                }
            }

            await Task.Delay(TimeSpan.FromDays(1), stoppingToken); // Kiểm tra mỗi phút
        }


        private async Task UpdatePlantStatuses()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var now = DateTime.UtcNow;
                // get farm co include luon growtstage(bo nhung cai bi xoa) - da bo farm bi xoa va farm isActive
                var farms = await _unitOfWork.FarmRepository.GetAllFarmOfSystem();
                foreach (var farm in farms)
                {
                    if (farm.GrowthStages.Any() && farm.GrowthStages.Count() > 1) // chua setup growtstage
                    {
                        var plantToUpdate = await _unitOfWork.PlantRepository.GetAllForBrService(farmId: farm.FarmId);
                        // Chỉ lấy plant - bỏ những cây chết - xoá - ko có PlantingDate
                        if (plantToUpdate.Any())
                        {
                            foreach (var pl in plantToUpdate)
                            {
                                int monthAge = pl.PlantingDate.Value.Month - DateTime.Now.Month;
                                if (monthAge < 0)
                                    continue;
                                if (monthAge == 0)
                                {
                                    monthAge = 1;
                                }
                                var growtstageId = farm.GrowthStages.Where(x => x.MonthAgeStart >= monthAge && x.MonthAgeEnd <= monthAge).Select(x => x.GrowthStageID).FirstOrDefault();
                                pl.GrowthStageID = growtstageId;
                            }
                        }
                        _logger.LogInformation($"Updated {plantToUpdate.Count} plant growtstage.");
                        // mỗi farm gọi update -> save 1 lần để cái nào chạy thì chạy khoi bị lỗi 
                        _unitOfWork.PlantRepository.UpdateRange(plantToUpdate);
                        await _unitOfWork.SaveAsync();
                    }
                }
            }
        }
    }
}
