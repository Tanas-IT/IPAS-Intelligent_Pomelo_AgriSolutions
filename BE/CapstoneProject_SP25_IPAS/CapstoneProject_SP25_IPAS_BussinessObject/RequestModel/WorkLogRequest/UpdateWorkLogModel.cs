using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
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
        [FlexibleTime]
        public string? StartTime { get; set; }
        [FlexibleTime]
        public string? EndTime { get; set; }
        public DateTime? DateWork { get; set; }
        public List<EmployeeModel>? listEmployee { get; set; }
        public List<PlanTargetModel>? PlanTargetModel { get; set; }
        public List<int>? GrowthStageIds { get; set; }
    }
}
