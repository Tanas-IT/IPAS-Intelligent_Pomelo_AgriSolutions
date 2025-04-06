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
                    await UpdateCropStatuses();
                    await UpdateHarvestStatuses();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating WorkLog statuses.");
                }
            }

            await Task.Delay(TimeSpan.FromDays(1), stoppingToken); // Kiểm tra mỗi ngày
        }


        //private async Task UpdatePlantStatuses()
        //{
        //    using (var scope = _scopeFactory.CreateScope())
        //    {
        //        var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        //        var now = DateTime.UtcNow;
        //        // get farm co include luon growtstage(bo nhung cai bi xoa) - da bo farm bi xoa va farm isActive
        //        var farms = await _unitOfWork.FarmRepository.GetAllFarmOfSystem();
        //        foreach (var farm in farms)
        //        {
        //            if (farm.GrowthStages != null /*&& farm.GrowthStages.Any() */&& farm.GrowthStages.Count() > 1) // chua setup growtstage
        //            {
        //                var plantToUpdate = await _unitOfWork.PlantRepository.GetAllForBrService(farmId: farm.FarmId);
        //                // Chỉ lấy plant - bỏ những cây chết - xoá - ko có PlantingDate
        //                if (plantToUpdate.Any())
        //                {
        //                    foreach (var pl in plantToUpdate)
        //                    {
        //                        int monthAge = pl.PlantingDate.Value.Month - DateTime.Now.Month;
        //                        if (monthAge < 0)
        //                            continue;
        //                        if (monthAge == 0)
        //                        {
        //                            monthAge = 1;
        //                        }
        //                        var growtstageId = farm.GrowthStages.Where(x => x.MonthAgeStart >= monthAge && x.MonthAgeEnd <= monthAge).Select(x => x.GrowthStageID).FirstOrDefault();
        //                        pl.GrowthStageID = growtstageId;
        //                    }
        //                }
        //                _logger.LogInformation($"Updated {plantToUpdate.Count} plant growtstage.");
        //                // mỗi farm gọi update -> save 1 lần để cái nào chạy thì chạy khoi bị lỗi 
        //                _unitOfWork.PlantRepository.UpdateRange(plantToUpdate);
        //                await _unitOfWork.SaveAsync();
        //            }
        //        }
        //    }
        //}
        private async Task UpdatePlantStatuses()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var now = DateTime.UtcNow;

                var farms = await _unitOfWork.FarmRepository.GetAllFarmOfSystem();
                foreach (var farm in farms)
                {
                    if (farm.GrowthStages != null && farm.GrowthStages.Count() > 1)
                    {
                        var plants = await _unitOfWork.PlantRepository.GetAllForBrService(farmId: farm.FarmId);

                        var plantsToUpdate = new List<Plant>();

                        foreach (var pl in plants)
                        {
                            if (pl.PlantingDate == null || pl.IsDeleted == true || pl.IsDead == true)
                                continue;

                            // Tính tuổi theo tháng
                            int monthAge = ((now.Year - pl.PlantingDate.Value.Year) * 12) + now.Month - pl.PlantingDate.Value.Month;
                            if (monthAge < 0) continue;

                            if (monthAge == 0) monthAge = 1;

                            var matchedGrowthStageId = farm.GrowthStages
                                .Where(x => x.MonthAgeStart <= monthAge && x.MonthAgeEnd >= monthAge)
                                .Select(x => x.GrowthStageID)
                                .FirstOrDefault();

                            // So sánh để tránh update thừa
                            if (matchedGrowthStageId != 0 && pl.GrowthStageID != matchedGrowthStageId)
                            {
                                pl.GrowthStageID = matchedGrowthStageId;
                                pl.LandRow = null;
                                plantsToUpdate.Add(pl);
                            }
                        }

                        if (plantsToUpdate.Any())
                        {
                            _unitOfWork.PlantRepository.UpdateRange(plantsToUpdate);
                            await _unitOfWork.SaveAsync();
                            _logger.LogInformation($"Updated {plantsToUpdate.Count} plant growth stages for farm {farm.FarmName}.");
                        }
                        else
                        {
                            _logger.LogInformation($"No plant growth stage changes for farm {farm.FarmName}.");
                        }
                    }
                }
            }
        }

        private async Task UpdateCropStatuses()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var now = DateTime.UtcNow;

                var crops = await _unitOfWork.CropRepository.GetAllNoPaging(x => x.IsDeleted != true && x.Farm!.IsDeleted == false, includeProperties: "Farm");

                var cropsToUpdate = new List<Crop>();

                foreach (var crop in crops)
                {
                    string newStatus = DetermineCropStatus(crop.StartDate, crop.EndDate, crop.CropActualTime);

                    if (!string.Equals(crop.Status, newStatus, StringComparison.OrdinalIgnoreCase))
                    {
                        crop.Status = newStatus;
                        crop.UpdateDate = now;
                        crop.Farm = null;
                        cropsToUpdate.Add(crop);
                    }
                }

                if (cropsToUpdate.Any())
                {
                    _unitOfWork.CropRepository.UpdateRange(cropsToUpdate);
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation($"Updated status for {cropsToUpdate.Count} crops.");
                }
                else
                {
                    _logger.LogInformation("No crop status changes.");
                }
            }
        }

        private async Task UpdateHarvestStatuses()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var _unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var now = DateTime.UtcNow;

                var harvestHistories = await _unitOfWork.HarvestHistoryRepository
                    .GetAllNoPaging(x => x.IsDeleted != true && !x.HarvestStatus.ToLower().Equals(HarvestStatusConst.Is_INCOMPLETED.ToLower()));

                var harvestHistoriesToUpdate = new List<HarvestHistory>();

                foreach (var harvestHistory in harvestHistories)
                {
                    string newStatus = DetermineHarvestStatus(harvestHistory.DateHarvest);

                    if (!string.Equals(harvestHistory.HarvestStatus, newStatus, StringComparison.OrdinalIgnoreCase))
                    {
                        harvestHistory.HarvestStatus = newStatus;
                        harvestHistoriesToUpdate.Add(harvestHistory);
                    }
                }

                if (harvestHistoriesToUpdate.Any())
                {
                    _unitOfWork.HarvestHistoryRepository.UpdateRange(harvestHistoriesToUpdate);
                    await _unitOfWork.SaveAsync();
                    _logger.LogInformation($"Updated status for {harvestHistoriesToUpdate.Count} harvest histories.");
                }
                else
                {
                    _logger.LogInformation("No harvest status changes.");
                }
            }
        }

        private string DetermineCropStatus(DateTime? startDate, DateTime? endDate, DateTime? cropActualTime)
        {
            DateTime now = DateTime.UtcNow;

            if (!startDate.HasValue)
                return CropStatusConst.Planned.ToString();

            if (now < startDate.Value)
                return CropStatusConst.Planned.ToString();

            if (now >= startDate.Value && (!endDate.HasValue || now < endDate.Value))
                return CropStatusConst.InCrop.ToString();

            if (endDate.HasValue && now >= endDate.Value && (!cropActualTime.HasValue || now < cropActualTime.Value))
                return CropStatusConst.Harvesting.ToString();

            if ((endDate.HasValue && now >= endDate.Value) || (cropActualTime.HasValue && now >= cropActualTime.Value))
                return CropStatusConst.Completed.ToString();

            return CropStatusConst.Planned.ToString();
        }

        private string DetermineHarvestStatus(DateTime? harvestDate)
        {
            if (!harvestDate.HasValue)
                return HarvestStatusConst.NOT_YET; // default status

            var currentDate = DateTime.UtcNow;

            // Nếu trước ngày thu hoạch
            if (currentDate < harvestDate.Value)
                return HarvestStatusConst.NOT_YET;

            if (currentDate > harvestDate.Value)
                return HarvestStatusConst.IS_COMPLETED;
            // Nếu sau ngày thu hoạch
            return HarvestStatusConst.IN_PROCESSING;
        }
    }
}
