using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel
{
    public class ProcessModel
    {
        public int ProcessId { get; set; }

        public string? ProcessCode { get; set; }

        public string? ProcessName { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }
        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool? IsDeleted { get; set; }
        public bool? IsSample { get; set; }
        public int? MasterTypeId { get; set; }

        public string? FarmName { get; set; }

        public ProcessMasterTypeModel? ProcessMasterTypeModel { get; set; }

        public ProcessGrowthStageModel? ProcessGrowthStageModel { get; set; }
        public string? ResourceUrl { get; set; }

        public string? Input { get; set; }
        public int? Order { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<SubProcessInProcessModel>? SubProcesses { get; set; } = new List<SubProcessInProcessModel>();

        public List<UpdatePlanInProcessModel>? ListPlan { get; set; } = new List<UpdatePlanInProcessModel>();
        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        // public List<ProcessDataInProcessModel>? ListProcessData { get; set; } = new List<ProcessDataInProcessModel>();
    }
}
