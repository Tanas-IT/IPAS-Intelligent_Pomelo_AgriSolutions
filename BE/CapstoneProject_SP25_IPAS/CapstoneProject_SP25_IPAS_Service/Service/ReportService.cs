using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;
using static System.Net.Mime.MediaTypeNames;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class ReportService : IReportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public ReportService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration, HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<BusinessResult> CropCareReport(int landPlotId, int year)
        {
            try
            {
                var totalTrees = _unitOfWork.PlanRepository.GetTotalTrees(landPlotId, year);
                var workLogs = await _unitOfWork.PlanRepository.GetWorkLogs(landPlotId, year);
                var totalTasks = workLogs.Count;
                var completedTasks = workLogs.Count(w => w.Status.ToLower() == "completed");

                var tasksByMonth = workLogs
                    .GroupBy(w => w.Date.Value.Month)
                    .Select(g => new TasksByMonthModel
                    {
                        Month = new DateTime(year, g.Key, 1).ToString("MMM"),
                        Completed = g.Count(w => w.Status.ToLower() == "completed"),
                        Remained = g.Count(w => w.Status.ToLower() != "completed")
                    }).ToList();

                var treeHealthStatus = _unitOfWork.PlanRepository.GetTreeHealthStatus(landPlotId);
                var treeNotes = _unitOfWork.PlanRepository.GetTreeNotes(landPlotId);

                var result = new CropCareReportModel
                {
                    LandPlotId = landPlotId,
                    Year = year,
                    TotalTrees = totalTrees,
                    TotalTasks = totalTasks,
                    CompletedTasks = completedTasks,
                    TasksByMonth = tasksByMonth,
                    TreeHealthStatus = treeHealthStatus,
                    TreeNotes = treeNotes
                };
                if (result != null)
                {
                    return new BusinessResult(Const.SUCCESS_GET_CROP_CARE_REPORT_CODE, Const.SUCCESS_GET_CROP_CARE_REPORT_MSG, result);
                }
                return new BusinessResult(Const.FAIL_GET_CROP_CARE_REPORT_CODE, Const.FAIL_GET_CROP_CARE_REPORT_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> Dashboard(int? year, int? month, int? farmId)
        {
            try
            {
                if (year == 0 || year == null) year = DateTime.Now.Year;
                if (month == 0 || month == null) month = DateTime.Now.Month;
                var totalPlant = await _unitOfWork.PlantRepository.getPlantInclude();
                var totalEmployee = await _unitOfWork.UserRepository.GetAllEmployeeByFarmId(farmId);
                var toltalTask = await _unitOfWork.WorkLogRepository.GetWorkLogInclude();
                var growthStagePercentage = totalPlant
                                               .Where(p => p.FarmId == farmId && p.GrowthStage != null) // Bỏ cây không có GrowthStage
                                               .GroupBy(p => p.GrowthStage.GrowthStageName)
                                               .ToDictionary(
                                                   g => g.Key!,
                                                   g => Math.Round((double)g.Count() / totalPlant.Where(p => p.FarmId == farmId).Count() * 100, 2) // Làm tròn 2 số thập phân
                                               );
                var plantHeathStatus = totalPlant
                                               .Where(p => p.FarmId == farmId && !string.IsNullOrEmpty(p.HealthStatus)) // Bỏ cây không có Status
                                               .GroupBy(p => p.HealthStatus)
                                               .ToDictionary(
                                                   g => g.Key!,
                                                   g => Math.Round((double)g.Count() / totalPlant.Where(p => p.FarmId == farmId).Count() * 100, 2) // Làm tròn 2 số thập phân
                                               );

                var filteredTask = toltalTask
                                 .Where(p => !string.IsNullOrEmpty(p.Status)) // Bỏ task không có status
                                 .Where(p => p.Schedule != null && p.Schedule.CarePlan != null) // Lọc trước khi gọi thuộc tính bên trong
                                 .Where(p =>
                                     p.Schedule.CarePlan.PlanTargets.Any(pt =>
                                         (pt.LandPlot != null && pt.LandPlot.FarmId == farmId) ||
                                         (pt.Plant != null && pt.LandRow != null && pt.LandRow.FarmId == farmId)
                                     )
                                 )
                                 .ToList();
                var totalFilteredTask = filteredTask.Count(); // Đếm số Task phù hợp

                var listTaskStatusDistribution = filteredTask
                    .GroupBy(x => x.Status)
                    .ToDictionary(
                        g => g.Key!,
                        g => Math.Round((double)g.Count() / totalFilteredTask * 100, 2)
                    );
                var taskStatusDistribution = new TaskStatusDistribution()
                {
                    TotalTask = toltalTask.Count(),
                    TaskStatus = listTaskStatusDistribution
                };
                var getFarm = await _unitOfWork.FarmRepository.GetFarmById(farmId.Value);
                string url = $"https://api.openweathermap.org/data/2.5/weather?lat={getFarm.Latitude}&lon={getFarm.Longitude}&appid={_configuration["SystemDefault:API_KEY_WEATHER"]}&units=metric";

                HttpResponseMessage response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                JObject weatherData = JObject.Parse(responseBody);
                var weatherProperty = new WeatherPropertyModel
                {
                    CurrentTemp = weatherData["main"]["temp"].Value<double>(),
                    TempMax = weatherData["main"]["temp_max"].Value<double>(),
                    TempMin = weatherData["main"]["temp_min"].Value<double>(),
                    Status = weatherData["weather"][0]["main"].Value<string>(),
                    Description = weatherData["weather"][0]["description"].Value<string>(),
                    Humidity = weatherData["main"]["humidity"].Value<double>(),
                    Visibility = weatherData["visibility"].Value<int>(),
                    Clouds = weatherData["clouds"]["all"].Value<double>(),
                    WindSpeed = weatherData["wind"]["speed"].Value<double>() + " m/s",
                };

                var dashboardModel = new DashboardModel()
                {
                    TotalPlant = totalPlant.Where(p => p.FarmId == farmId).ToList().Count(),
                    TotalEmployee = totalEmployee,
                    TotalTask = totalFilteredTask,
                    PlantDevelopmentDistribution = growthStagePercentage,
                    PlantDevelopmentStages = growthStagePercentage,
                    PlantHealthStatus = plantHeathStatus,
                    TaskStatusDistribution = taskStatusDistribution,
                    WeatherPropertyModel = weatherProperty,
                    MaterialsInStoreModels = await GetDataForMaterialsInStore(year.Value, farmId),
                    PomeloQualityBreakDowns = await GetDataForPomeloQualityBreakDown(year.Value, farmId),
                    ProductivityByPlots = await GetDataForProductivityByPlot(year.Value, farmId),
                    SeasonalYields = await GetDataForSeasonYield(year.Value, farmId),
                    WorkProgressOverviews = await GetDataForWorkprogressOverview(year.Value, month.Value, farmId),

                };

                if (dashboardModel != null)
                {
                    return new BusinessResult(Const.SUCCESS_GET_DASHBOARD_REPORT_CODE, Const.SUCCESS_GET_DASHBOARD_REPORT_MSG, dashboardModel);
                }
                return new BusinessResult(Const.FAIL_GET_DASHBOARD_REPORT_CODE, Const.FAIL_GET_DASHBOARD_REPORT_MSG, null);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private async Task<List<MaterialsInStoreModel>> GetDataForMaterialsInStore(int year, int? farmId)
        {
            if (year == 0 || year == null) year = DateTime.Now.Year;
            var getListHarvestHistoryTemp = await _unitOfWork.HarvestHistoryRepository.GetHarvestHistoryInclude(farmId);

            var getListHarvestHistory = getListHarvestHistoryTemp.Where(x => x.DateHarvest.HasValue && x.DateHarvest.Value.Year == year)
                                    .GroupBy(p => p.DateHarvest.Value.ToString("MM-yyyy")) // Nhóm theo mùa
                                    .Select(g => new MaterialsInStoreModel
                                    {
                                        Month = g.Key,  // Key là mùa
                                        Materials = g.SelectMany(h => h.ProductHarvestHistories)
                                        .GroupBy(ht => new { ht.MasterTypeId})
                                        .Select(x => new Materials
                                        {
                                            ProductType = x.FirstOrDefault().Product.MasterTypeName,
                                            UnitOfMaterials = new UnitOfMaterials()
                                            {
                                                Unit = x.FirstOrDefault().Unit,
                                                Value = x.FirstOrDefault().ActualQuantity
                                            }
                                        }).ToList()
                                        /*
                                           ,
                                                                                Count = g.SelectMany(h => h.ProductHarvestHistories)
                                                                                         .Where(x => x.Plant != null
                                                                                                  && x.Plant.LandRow != null
                                                                                                  && x.Plant.LandRow.LandPlot != null
                                                                                                  && x.Plant.LandRow.LandPlot.Farm != null
                                                                                                  && x.Plant.LandRow.LandPlot.Farm.FarmId == farmId)
                                                                                         .Sum(ht => ht.QuantityNeed),
                                                                                TypeOfProduct = g.SelectMany(h => h.ProductHarvestHistories)
                                                                                .Where(x => x.Plant != null
                                                                                         && x.Plant.LandRow != null
                                                                                         && x.Plant.LandRow.LandPlot != null
                                                                                         && x.Plant.LandRow.LandPlot.Farm != null
                                                                                         && x.Plant.LandRow.LandPlot.Farm.FarmId == farmId)
                                                                                .GroupBy(ht => new { ht.Plant.PlantName, ht.Product.MasterTypeName }) // Nhóm theo tên cây và loại cây
                                                                                .Select(plantGroup => new TypeOfProduct
                                                                                {
                                                                                    PlantName = plantGroup.Key.PlantName, // Tên cây
                                                                                    MasterTypeName = plantGroup.Key.MasterTypeName, // Loại cây
                                                                                    TotalQuantity = plantGroup.Sum(p => p.QuantityNeed) // Tổng số lượng
                                                                                })
                                                                                .ToList()
                                         */
                                    }).ToList();
            return getListHarvestHistory;
        }

        private async Task<List<PomeloQualityBreakDown>> GetDataForPomeloQualityBreakDown(int? year, int? farmId)
        {
            if (year == 0 || year == null) year = DateTime.Now.Year;
            var rawData = await _unitOfWork.ProductHarvestHistoryRepository.GetHarvestDataByYear(year.Value, farmId);

            // Nhóm dữ liệu theo mùa vụ
            var groupedData = rawData
                .GroupBy(ht => new { ht.HarvestHistory.Crop.HarvestSeason, ht.Product.MasterTypeName })
                .Select(g => new
                {
                    HarvestSeason = g.Key.HarvestSeason ?? "Không xác định",
                    QualityType = g.Key.MasterTypeName ?? "Không xác định",
                    Quantity = g.Sum(ht => ht.QuantityNeed ?? 0)
                })
                .ToList();

            // Tính tổng sản lượng theo từng mùa
            var totalBySeason = groupedData
                .GroupBy(g => g.HarvestSeason)
                .ToDictionary(g => g.Key, g => g.Sum(q => q.Quantity));

            // Xây dựng danh sách kết quả
            var result = groupedData
                .GroupBy(g => g.HarvestSeason)
                .Select(g => new PomeloQualityBreakDown
                {
                    HarvestSeason = g.Key,
                    QualityStats = g.Select(q => new QualityStat
                    {
                        QualityType = q.QualityType,
                        Percentage = Math.Round(totalBySeason[g.Key] == 0 ? 0 : (double)q.Quantity / totalBySeason[g.Key] * 100, 2)
                    }).ToList()
                })
                .OrderBy(s => s.HarvestSeason)
                .ToList();
            return result;
        }

        private async Task<List<SeasonalYieldModel>> GetDataForSeasonYield(int? year, int? farmId)
        {
            var rawData = await _unitOfWork.ProductHarvestHistoryRepository.GetHarvestDataByYear(year.Value, farmId);

            // Nhóm dữ liệu theo mùa vụ và loại sản phẩm
           

            // Nhóm dữ liệu theo mùa vụ
            var result = rawData
                      .GroupBy(x => x.HarvestHistoryId)
                      .Select(g => new SeasonalYieldModel
                      {
                          HarvestSeason = g.FirstOrDefault()?.HarvestHistory?.Crop?.HarvestSeason ?? "",

                          QualityStats = g
                              .GroupBy(ht => ht.MasterTypeId)
                              .Select(q => new QualityYieldStat
                              {
                                  QualityType = q.FirstOrDefault()?.Product?.MasterTypeName ?? "",
                                  QuantityYield = q.Sum(x => x.ActualQuantity ?? 0)
                              }).ToList()
                      })
                      .OrderBy(s => s.HarvestSeason)
                      .ToList();
            return result;
        }

        private async Task<List<WorkProgressOverview>> GetDataForWorkprogressOverview(int? year, int? month, int? farmId)
        {
            var getListWorkLogByYearAndMonth = await _unitOfWork.WorkLogRepository.GetListWorkLogByYearAndMonth(year.Value, month.Value, farmId);
            var result = getListWorkLogByYearAndMonth.Select(wl => new WorkProgressOverview()
            {
                TaskId = wl.WorkLogId,
                TaskName = wl.WorkLogName,
                Status = wl.Status,
                DueDate = wl.Date,
                listEmployee = wl.UserWorkLogs.Select(uwl => new EmployeeWorkProgressModel
                {
                    UserId = uwl.UserId,
                    FullName = uwl.User.FullName,
                    IsReporter = uwl.IsReporter,
                    AvatarURL = uwl.User.AvatarURL
                }).ToList()
            })
            .ToList();
            return result;
        }

        private async Task<List<ProductivityByPlotModel>> GetDataForProductivityByPlot(int? year, int? farmId)
        {

            var getListLandPlot = await _unitOfWork.LandPlotRepository.GetLandPlotInclude();
            var result = getListLandPlot
                                    .Where(lp => lp.Farm.FarmId == farmId && lp.LandPlotCrops.Any(x => x.Crop.StartDate.Value.Year == year))
                                    .SelectMany(lp => lp.LandPlotCrops, (lp, lpc) => new
                                    {
                                        //Year = lpc.Crop.Year ?? 0,
                                        Year = lpc.Crop.StartDate.Value.Year,
                                        HarvestSeason = lpc.Crop.HarvestSeason ?? "Không xác định",
                                        LandPlotId = lp.LandPlotId,
                                        LandPlotName = lp.LandPlotName,
                                        Status = lp.Status,
                                        Quantity = lpc.Crop.HarvestHistories
                                            .SelectMany(hh => hh.ProductHarvestHistories)
                                            .Sum(hth => hth.QuantityNeed ?? 0)
                                    })
                                     .GroupBy(x => new { x.Year, x.HarvestSeason })
                                    .Select(group => new ProductivityByPlotModel
                                    {
                                        Year = group.Key.Year,
                                        HarvestSeason = group.Key.HarvestSeason,
                                        LandPlots = group.GroupBy(lp => lp.LandPlotId)
                                                         .Select(g => new LandPlotResult
                                                         {
                                                             LandPlotId = g.Key,
                                                             LandPlotName = g.First().LandPlotName,
                                                             TotalPlantOfLandPlot = g.Count(),
                                                             Quantity = g.Sum(lp => lp.Quantity),
                                                             Status = g.First().Status
                                                         }).ToList()
                                    })
                                    .ToList();
            return result;
        }

        public async Task<BusinessResult> MaterialsInStore(int year, int? farmId)
        {
            try
            {
               var result = await GetDataForMaterialsInStore(year, farmId);
                if (result != null)
                {
                    if (result.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_MATERIALS_IN_STORE_REPORT_CODE, Const.SUCCESS_GET_MATERIALS_IN_STORE_REPORT_MSG, result);
                    }
                    return new BusinessResult(Const.WARNING_GET_MATERIALS_IN_STORE_REPORT_CODE, Const.WARNING_GET_MATERIALS_IN_STORE_REPORT_MSG);

                }
                return new BusinessResult(Const.FAIL_GET_MATERIALS_IN_STORE_REPORT_REPORT_CODE, Const.FAIL_GET_MATERIALS_IN_STORE_REPORT_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> PomeloQualityBreakDown(int year, int? farmId)
        {
            try
            {
                var result = await GetDataForPomeloQualityBreakDown(year, farmId);
                if(result != null)
                {
                    if (result.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_CODE, Const.SUCCESS_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_MSG, result);
                    }
                    return new BusinessResult(Const.WARNING_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_CODE, Const.SUCCESS_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_MSG);
                }
                return new BusinessResult(Const.FAIL_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_CODE, Const.FAIL_GET_POMELO_QUALITY_BREAK_DOWN_REPORT_MSG);

            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);

            }
        }

        public async Task<BusinessResult> ProductivityByPlot(int year, int? farmId)
        {
            try
            {
                var result = await GetDataForProductivityByPlot(year, farmId);

                if (result != null)
                {
                    if (result.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE, Const.SUCCESS_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG, result);
                    }
                    return new BusinessResult(Const.WARNING_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE, Const.WARNING_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG);

                }
                return new BusinessResult(Const.FAIL_GET_PRODUCTIVITY_BY_PLOT_REPORT_CODE, Const.FAIL_GET_PRODUCTIVITY_BY_PLOT_REPORT_MSG);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> SeasonYield(int year, int? farmId)
        {
            try
            {

               var result = await GetDataForSeasonYield(year, farmId);

                if (result != null)
                {
                    if (result.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_SEASON_YIELD_REPORT_CODE, Const.SUCCESS_GET_SEASON_YIELD_REPORT_MSG, result);
                    }
                    return new BusinessResult(Const.WARNING_GET_SEASON_YIELD_REPORT_CODE, Const.WARNING_GET_SEASON_YIELD_REPORT_MSG);
                }
                return new BusinessResult(Const.FAIL_GET_SEASON_YIELD_REPORT_CODE, Const.FAIL_GET_SEASON_YIELD_REPORT_MSG);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }   

        public async Task<BusinessResult> WorkProgressOverview(int year, int month, int? farmId)
        {
            try
            {
                var result = await GetDataForWorkprogressOverview(year, month, farmId);
                if (result != null)
                {
                    if(result.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_WORK_PROGRESS_OVERVIEW_REPORT_CODE, Const.SUCCESS_GET_WORK_PROGRESS_OVERVIEW_REPORT_MSG, result);
                    }
                    return new BusinessResult(Const.WARNING_GET_WORK_PROGRESS_OVERVIEW_REPORT_CODE, Const.WARNING_GET_WORK_PROGRESS_OVERVIEW_REPORT_MSG);
                }
                return new BusinessResult(Const.FAIL_GET_WORK_PROGRESS_OVERVIEW_REPORT_CODE, Const.FAIL_WORK_PROGRESS_OVERVIEW_REPORT_MSG);

            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        private string GetSeasonFromDate(DateTime date)
        {
            int month = date.Month;
            return month switch
            {
                1 or 2 or 3 => "Spring " + date.Year.ToString(),
                4 or 5 or 6 => "Summer " + date.Year.ToString(),
                7 or 8 or 9 => "Fall " + date.Year.ToString(),
                _ => "Winter"
            };
        }

        public async Task<BusinessResult> GetWeatherOfFarm(int farmId)
        {
            try
            {
                var getFarm = await _unitOfWork.FarmRepository.GetFarmById(farmId);
                string url = $"https://api.openweathermap.org/data/2.5/weather?lat={getFarm.Latitude}&lon={getFarm.Longitude}&appid={_configuration["SystemDefault:API_KEY_WEATHER"]}&units=metric";

                HttpResponseMessage response = await _httpClient.GetAsync(url);
                response.EnsureSuccessStatusCode();
                string responseBody = await response.Content.ReadAsStringAsync();

                JObject weatherData = JObject.Parse(responseBody);

                return new BusinessResult(200, "Get Weather Of Farm Success", weatherData);
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> StatisticEmployee(int farmID)
        {
            try
            {
                var toltalTask = await _unitOfWork.WorkLogRepository.GetWorkLogInclude();
                var filteredTask = toltalTask
                               .Where(p => !string.IsNullOrEmpty(p.Status)) // Bỏ task không có status
                               .Where(p => p.Schedule != null && p.Schedule.CarePlan != null)
                               .Where(x => x.Schedule.FarmID == farmID || x.Schedule.CarePlan.FarmID == farmID )// Lọc trước khi gọi thuộc tính bên trong
                               .ToList();
                var totalFilteredTask = filteredTask.Count(); // Đếm số Task phù hợp

                var listTaskStatusDistribution = filteredTask
                    .GroupBy(x => x.Status)
                    .ToDictionary(
                        g => g.Key!,
                        g => Math.Round((double)g.Count() / totalFilteredTask * 100, 2)
                    );
                var taskStatusDistribution = new TaskStatusDistribution()
                {
                    TotalTask = toltalTask.Count(),
                    TaskStatus = listTaskStatusDistribution
                };
                if(taskStatusDistribution != null)
                {
                    return new BusinessResult(200, "Statistic Employee Success", taskStatusDistribution);
                }
                return new BusinessResult(400, "Statistic Employee Failed");
            }
            catch (Exception ex)
            {

                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }


        
    }
}
