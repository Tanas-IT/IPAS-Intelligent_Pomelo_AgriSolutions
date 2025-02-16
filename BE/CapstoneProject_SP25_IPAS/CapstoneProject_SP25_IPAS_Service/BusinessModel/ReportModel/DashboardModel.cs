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
        public Dictionary<string, double>? PlantDevelopmentDistribution { get; set; }
        public Dictionary<string, double>? PlantDevelopmentStages { get; set; }
        public Dictionary<string, double>? PlantHealthStatus { get; set; }
        public TaskStatusDistribution? TaskStatusDistribution { get; set; }

    }
}
