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
    }
}
