using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class ScheduleModel
    {
        public int WorkLogId { get; set; }
        public string? WorkLogName { get; set; }
        public string? WorkLogCode { get; set; }
        public DateTime? Date { get; set; }
        public string? Status { get; set; }
        public string? Notes { get; set; }
        public int? ScheduleId { get; set; }
        public TimeSpan? StartTime { get; set; }
        public TimeSpan? EndTime { get; set; }
        public int? PlanId { get; set; }
        public string? PlanName { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public List<UserScheduleModel>? Users { get; set; }
    }
}
