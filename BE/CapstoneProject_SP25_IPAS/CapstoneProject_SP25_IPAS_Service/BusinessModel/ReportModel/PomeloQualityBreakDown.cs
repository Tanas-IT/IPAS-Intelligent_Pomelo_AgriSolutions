using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class PomeloQualityBreakDown
    {
        public string HarvestSeason { get; set; } = string.Empty; // Mùa vụ (Xuân, Hè, Thu, Đông)
        public List<QualityStat> QualityStats { get; set; } = new List<QualityStat>();
    }
    public class QualityStat
    {
        public string QualityType { get; set; } = string.Empty;
        public double Percentage { get; set; }
    }
}
