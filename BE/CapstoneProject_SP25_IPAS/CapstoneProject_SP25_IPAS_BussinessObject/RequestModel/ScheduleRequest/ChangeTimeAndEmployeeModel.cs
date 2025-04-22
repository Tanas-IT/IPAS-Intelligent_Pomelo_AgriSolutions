using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ScheduleRequest
{
    public class ChangeTimeAndEmployeeModel
    {
        public int WorkLogId {  get; set; }
        [FlexibleTime]
        public string? StartTime { get; set; }
        [FlexibleTime]
        public string? EndTime { get; set; }
        public DateTime? DateWork { get; set; }
        public List<ChangeEmploeeScheduleModel> ListEmployeeUpdate { get; set; } = new List<ChangeEmploeeScheduleModel>();
    }
}
