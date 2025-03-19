using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class AddWorkLogModel
    {
        public string? WorkLogName { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
           ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? StartTime { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
           ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? EndTime { get; set; }
        public DateTime DateWork { get; set; }
        public int? PlanId  { get; set; }
        public List<EmployeeModel>? listEmployee { get; set; }
    }
}
