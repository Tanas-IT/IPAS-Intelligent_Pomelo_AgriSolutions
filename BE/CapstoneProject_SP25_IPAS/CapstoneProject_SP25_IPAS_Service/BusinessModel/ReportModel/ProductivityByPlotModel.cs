using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class ProductivityByPlotModel
    {
        public string HarvestSeason { get; set; } = string.Empty;
        public int Year { get; set; }
        public List<LandPlotResult> LandPlots { get; set; } = new List<LandPlotResult>();
    }

    public class LandPlotResult
    {
        public int LandPlotId { get; set; }
        public string LandPlotName { get; set; } = string.Empty;
        public int TotalPlantOfLandPlot { get; set; }
        public double Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
