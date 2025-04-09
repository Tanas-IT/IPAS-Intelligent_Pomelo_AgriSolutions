using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class EmployeeProductivityTimeDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; }

        public DateTime? Date { get; set; } // dùng khi groupBy = day
        public int? Week { get; set; }      // dùng khi groupBy = week
        public int? Month { get; set; }     // dùng khi groupBy = month
        public int? Year { get; set; }

        public int TotalWorkLogs { get; set; }
        public int CompletedWorkLogs { get; set; }
        public double CompletionRate { get; set; }

        public TimeSpan TotalWorkingTime { get; set; }

        public int ReplaceOthersCount { get; set; } // số lần thay thế người khác 
        public int ReplacedByOthersCount { get; set; } // số lần bị người khác thay thế

        public int RedoWorkCount { get; set; } // Số lần làm lại workLog
        public double RedoWorkCompletionRate { get; set; }
     
    }
}
