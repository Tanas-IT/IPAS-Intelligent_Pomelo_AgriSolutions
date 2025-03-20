using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class UpdateWorkLogModel
    {
        public int WorkLogId { get; set; }
        public string? WorkLogName { get; set; }
        public bool? IsConfirm { get; set; }
        public string? Status { get; set; }
        public int? MasterTypeId { get; set; }
        public int? ProcessId { get; set; }
        public int? CropId { get; set; }
        public int? LandPlotId { get; set; }
        public int? AssignorId { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
           ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? StartTime { get; set; }
        [RegularExpression(@"^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$",
           ErrorMessage = "Time must be in HH:mm:ss format (e.g., 08:05:09)")]
        public string? EndTime { get; set; }
        public DateTime? DateWork { get; set; }
        public List<EmployeeModel>? listEmployee { get; set; }
        public List<PlanTargetModel>? PlanTargetModel { get; set; }
        public List<int>? GrowthStageIds { get; set; }
    }
}
