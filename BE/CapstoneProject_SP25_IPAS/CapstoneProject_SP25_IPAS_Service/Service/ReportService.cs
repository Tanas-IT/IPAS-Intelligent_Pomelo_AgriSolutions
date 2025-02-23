using AutoMapper;
using CapstoneProject_SP25_IPAS_Common;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

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

        public async Task<BusinessResult> Dashboard(int? farmId)
        {
            try
            {
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
                                               .Where(p => p.LandRow.LandPlot.Farm.FarmId == farmId && !string.IsNullOrEmpty(p.HealthStatus)) // Bỏ cây không có Status
                                               .GroupBy(p => p.HealthStatus)
                                               .ToDictionary(
                                                   g => g.Key!,
                                                   g => Math.Round((double)g.Count() / totalPlant.Where(p => p.LandRow.LandPlot.Farm.FarmId == farmId).Count() * 100, 2) // Làm tròn 2 số thập phân
                                               );

                var filteredTask = toltalTask
                                     .Where(p => !string.IsNullOrEmpty(p.Status)) // Bỏ task không có status
                                     .Where(p =>
                                         p.Schedule.CarePlan.PlanTargets.Any(pt =>
                                             (pt.LandPlot != null && pt.LandPlot.Farm.FarmId == farmId) || // Kiểm tra LandPlot thuộc Farm
                                             (pt.Plant != null && pt.LandRow != null && pt.LandRow.LandPlot.Farm.FarmId == farmId) // Kiểm tra Plant và LandRow
                                         )
                                     )
                                     .ToList(); // Tránh gọi Count() nhiều lần

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
                var weatherProperty =  new WeatherPropertyModel
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
                    TotalPlant = totalPlant.Where(p => p.LandRow.LandPlot.Farm.FarmId == farmId).ToList().Count(),
                    TotalEmployee = totalEmployee,
                    TotalTask = totalFilteredTask,
                    PlantDevelopmentDistribution = growthStagePercentage,
                    PlantDevelopmentStages = growthStagePercentage,
                    PlantHealthStatus = plantHeathStatus,
                    TaskStatusDistribution = taskStatusDistribution,
                    WeatherPropertyModel = weatherProperty
                };

                if(dashboardModel != null )
                {
                    return new BusinessResult(Const.SUCCESS_GET_DASHBOARD_REPORT_CODE, Const.SUCCESS_GET_DASHBOARD_REPORT_MSG, dashboardModel );
                }
                return new BusinessResult(Const.FAIL_GET_DASHBOARD_REPORT_CODE, Const.FAIL_GET_DASHBOARD_REPORT_MSG, null);
            }
            catch (Exception ex)
            {
                return new BusinessResult(Const.ERROR_EXCEPTION, ex.Message);
            }
        }

        public async Task<BusinessResult> MaterialsInStore(int year, int farmId)
        {
            try
            {
                if (year == 0) year = DateTime.Now.Year;
                var getListHarvestHistoryTemp = await _unitOfWork.HarvestHistoryRepository.GetHarvestHistoryInclude();
               
                var getListHarvestHistory = getListHarvestHistoryTemp.Where(x => x.DateHarvest.HasValue && x.DateHarvest.Value.Year == year)
                                        .GroupBy(p => p.Crop.HarvestSeason) // Nhóm theo mùa
                                        .Select(g => new
                                        {
                                            Season = g.Key,  // Key là mùa
                                            Count = g.SelectMany(h => h.HarvestTypeHistories)
                                                     .Where(x => x.Plant != null
                                                              && x.Plant.LandRow != null
                                                              && x.Plant.LandRow.LandPlot != null
                                                              && x.Plant.LandRow.LandPlot.Farm != null
                                                              && x.Plant.LandRow.LandPlot.Farm.FarmId == farmId)
                                                     .Sum(ht => ht.Quantity),
                                            TypeOfProduct = g.SelectMany(h => h.HarvestTypeHistories)
                                            .Where(x => x.Plant != null
                                                     && x.Plant.LandRow != null
                                                     && x.Plant.LandRow.LandPlot != null
                                                     && x.Plant.LandRow.LandPlot.Farm != null
                                                     && x.Plant.LandRow.LandPlot.Farm.FarmId == farmId)
                                            .GroupBy(ht => new { ht.Plant.PlantName, ht.MasterType.MasterTypeName }) // Nhóm theo tên cây và loại cây
                                            .Select(plantGroup => new
                                            {
                                                PlantName = plantGroup.Key.PlantName, // Tên cây
                                                MasterTypeName = plantGroup.Key.MasterTypeName, // Loại cây
                                                TotalQuantity = plantGroup.Sum(p => p.Quantity) // Tổng số lượng
                                            })
                                            .ToList()
                                        }).ToList();
                if(getListHarvestHistory != null)
                {
                    if(getListHarvestHistory.Count > 0)
                    {
                        return new BusinessResult(Const.SUCCESS_GET_MATERIALS_IN_STORE_REPORT_CODE, Const.SUCCESS_GET_MATERIALS_IN_STORE_REPORT_MSG, getListHarvestHistory);
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

        public Task<BusinessResult> PomeloQualityBreakDown(int year)
        {
            throw new NotImplementedException();
        }

        public async Task<BusinessResult> ProductivityByPlot(int farmId, int year)
        {
            try
            {
                var getListLandPlot = await _unitOfWork.LandPlotRepository.GetLandPlotInclude();
                var result = getListLandPlot
                                        .Where(lp => lp.Farm.FarmId == farmId && lp.LandPlotCrops.Any(x => x.Crop.Year == year))
                                        .SelectMany(lp => lp.LandPlotCrops, (lp, lpc) => new
                                        {
                                            Year = lpc.Crop.Year ?? 0,
                                            HarvestSeason = lpc.Crop.HarvestSeason ?? "Không xác định",
                                            LandPlotId = lp.LandPlotId,
                                            LandPlotName = lp.LandPlotName,
                                            Status = lp.Status,
                                            Quantity = lpc.Crop.HarvestHistories
                                                .SelectMany(hh => hh.HarvestTypeHistories)
                                                .Sum(hth => hth.Quantity ?? 0)
                                        })
                                         .GroupBy(x => new { x.Year, x.HarvestSeason })
                                        .Select(group => new
                                        {
                                            HarvestSeason = group.Key,
                                            LandPlots = group.GroupBy(lp => lp.LandPlotId)
                                                             .Select(g => new
                                                             {
                                                                 LandPlotId = g.Key,
                                                                 LandPlotName = g.First().LandPlotName,
                                                                 TotalPlantOfLandPlot = g.Count(),
                                                                 Quantity = g.Sum(lp => lp.Quantity),
                                                                 Status = g.First().Status
                                                             }).ToList()
                                        })
                                        .ToList();

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

        public Task<BusinessResult> SeasonYield(int year, int farmId, int month)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> WorkProgressOverview(int month)
        {
            throw new NotImplementedException();
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
    }
}
