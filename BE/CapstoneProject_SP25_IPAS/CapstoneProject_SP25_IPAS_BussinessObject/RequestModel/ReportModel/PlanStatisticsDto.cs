using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class PlanStatisticsDto
    {
        public List<MonthlyPlanStatsDto> PlansByMonth { get; set; } = new();
        public Dictionary<string, int> StatusDistribution { get; set; } = new();
        public Dictionary<string, int> PlanByWorkType { get; set; } = new();
        public PlanStatusSummaryDto StatusSummary { get; set; } = new();
    }
    public class MonthlyPlanStatsDto
    {
        public int Month { get; set; }
        public int TotalPlans { get; set; }
    }

    public class PlanStatusSummaryDto
    {
        public int Total { get; set; }
        public Dictionary<string, int> Status { get; set; } = new();
    }
}
