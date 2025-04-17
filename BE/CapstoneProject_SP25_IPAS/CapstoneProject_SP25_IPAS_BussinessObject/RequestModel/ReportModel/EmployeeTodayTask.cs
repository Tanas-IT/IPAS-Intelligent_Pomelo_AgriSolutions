using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ReportModel
{
    public class EmployeeTodayTask
    {
        public int? WorkLogId { get; set; }
        public string? WorkLogName { get; set; } 
        public string? Status { get; set; }
        public string? Time {  get; set; }
    }
}
