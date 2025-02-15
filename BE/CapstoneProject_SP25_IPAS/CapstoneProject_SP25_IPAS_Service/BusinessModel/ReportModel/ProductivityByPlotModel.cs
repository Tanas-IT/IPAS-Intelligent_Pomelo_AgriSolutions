using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class ProductivityByPlotModel
    {
        public int? LandPlotId { get; set; }
        public string? LandPlotName { get; set; }
        public int? TotalPlant { get; set; }
        public double? Productivity {  get; set; }
        public string? Status { get; set; }
    }
}
