using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class CropCareReportModel
    {
        public int LandPlotId { get; set; }
        public int Year { get; set; }
        public int TotalTrees { get; set; }
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public List<TasksByMonthModel> TasksByMonth { get; set; }
        public Dictionary<string, int> TreeHealthStatus { get; set; }
        public List<object> TreeNotes { get; set; }
    }
}
