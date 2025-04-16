using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class EmployeeProductivityResponse
    {
        public int TasksCompleted { get; set; }
        public double HoursWorked { get; set; }
        public int SkillScore { get; set; }
        public int AiReportsSubmitted { get; set; }
        public int TasksPendingToday { get; set; }
        public ProductivityChart ChartData { get; set; }
    }
    public class ProductivityChart
    {
        public List<ProductivityChartItem> Tasks { get; set; }
    }
    public class ProductivityChartItem
    {
        public string Label { get; set; }
        public int Count { get; set; }
    }
}
