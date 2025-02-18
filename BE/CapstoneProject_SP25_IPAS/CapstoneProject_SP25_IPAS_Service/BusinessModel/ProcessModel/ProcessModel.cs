using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
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

        public bool? IsDeleted { get; set; }

        public string? FarmName { get; set; }

        public string? MasterTypeName { get; set; }

        public string? GrowthStageName { get; set; }
        public string? ResourceUrl { get; set; }

        public string? Input { get; set; }
        public string? Order { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<SubProcessInProcessModel>? SubProcesses { get; set; } = new List<SubProcessInProcessModel>();
        //[JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
       // public List<ProcessDataInProcessModel>? ListProcessData { get; set; } = new List<ProcessDataInProcessModel>();
    }
}
