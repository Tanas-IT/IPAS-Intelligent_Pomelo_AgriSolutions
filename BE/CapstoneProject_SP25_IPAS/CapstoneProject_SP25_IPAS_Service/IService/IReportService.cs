using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IReportService
    {
        public Task<BusinessResult> CropCareReport(int landPlotId, int year);
        public Task<BusinessResult> Dashboard(int? year, int? month, int? farmId);
        public Task<BusinessResult> MaterialsInStore(int year, int? farmId);
        public Task<BusinessResult> ProductivityByPlot(int year, int? farmId);
        public Task<BusinessResult> SeasonYield(int year, int? farmId);
        public Task<BusinessResult> PomeloQualityBreakDown(int year, int? farmId);
        public Task<BusinessResult> WorkProgressOverview(int year, int month, int? farmId);
        public Task<BusinessResult> GetWeatherOfFarm(int farmId);
        public Task<BusinessResult> StatisticEmployee(int farmID);
        public Task<BusinessResult> StatisticPlan(int? month, int? year, int? farmID);
        public Task<BusinessResult> GetWorkPerformanceAsync(WorkPerformanceRequestDto request, int? farmId);
        public Task<BusinessResult> GetWorkPerformanceCompareAsync(WorkPerFormanceCompareDto request, int? farmId);
        public Task<BusinessResult> AdminDashBoard(GetAdminDashBoardRequest request);
        public Task<BusinessResult> EmployeeTodayTask(int userId);
        public Task<BusinessResult> EmployeeProductivity(int userId, string? timeRange);
        public Task<BusinessResult> StatisticPlantDeadAndAlive(int farmId);

    }
}
