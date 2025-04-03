using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class SeasonalYieldModel
    {
        public string HarvestSeason { get; set; }
        public List<QualityYieldStat> QualityStats { get; set; }
    }
    public class QualityYieldStat
    {
        public string QualityType { get; set; }
        public double QuantityYield { get; set; }
    }
}
