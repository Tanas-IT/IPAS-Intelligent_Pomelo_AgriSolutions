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
        public Task<BusinessResult> Dashboard(int farmId);
        public Task<BusinessResult> MaterialsInStore(int year, int farmId);
        public Task<BusinessResult> ProductivityByPlot(int farmId, int year);
        public Task<BusinessResult> SeasonYield(int year, int farmId, int month);
        public Task<BusinessResult> PomeloQualityBreakDown(int year);
        public Task<BusinessResult> WorkProgressOverview(int month);
    }
}
