using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class DashboardModel
    {
        public int TotalPlant { get; set; }
        public int TotalEmployee { get; set; }
        public int TotalTask { get; set; }
        public WeatherPropertyModel? WeatherPropertyModel { get; set; }
        public Dictionary<string, string>? PlantDevelopmentDistribution { get; set; }
        public Dictionary<string, string>? PlantDevelopmentStages { get; set; }
        public List<MediaInStoreModel>? MaterialsInStore { get; set; } // Tách
        public ProductivityByPlotModel?  ProductivityByPlot { get; set; } // Tách
        public List<SeasonalYieldModel>? SeasonYield { get; set; } // Tách
        public PomeloQualityBreakDown? PomeloQualityBreakDown { get; set; } // Tách
        public WorkProgressOverview? WorkProgressOverview { get; set; }// Tách
        public TaskStatusDistribution? TaskStatusDistribution { get; set; }// Tách

    }
}
