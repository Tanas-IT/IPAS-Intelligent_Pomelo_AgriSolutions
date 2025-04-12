using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class WorkPerformanceRequestDto
    {
        public int? Limit { get; set; }
        public double? MinScore { get; set; }
        public double? MaxScore { get; set; }
        public string? Type { get; set; }
        public string? Search {  get; set; }
    }
    public class WorkPerFormanceCompareDto
    {
        public List<int>? ListEmployee { get; set; }
    }
}
