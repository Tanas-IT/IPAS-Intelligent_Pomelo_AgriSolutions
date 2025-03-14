using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class UpdateProcessModel
    {
        public int ProcessId { get; set; }
        public string? ProcessName { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDefault { get; set; }

        public bool? IsDeleted { get; set; }


        public int? MasterTypeId { get; set; }

        public int? GrowthStageID { get; set; }
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [DefaultValue(new[] {
    "{SubProcessId: 1,SubProcessName: \"Sub 1\", Status: \"add\", ParentSubProcessId: 0, IsDefault: true, IsActive: true, MasterTypeId: 1, ListPlan: [{PlanId: 0,PlanName: \"Plan 1\", PlanDetail: \"Chi tiết 1\", PlanStatus: \"add\", PlanNote: \"Ghi chú 1\", GrowthStageId: 2, MasterTypeId: 3}]}"
})]
        public List<string>? ListUpdateSubProcess { get; set; } = new List<string>();
        [DefaultValue(new[] { "{PlanId: 0, PlanName: \"string\", PlanDetail: \"string\", PlanNote: \"string\", PlanStatus: \"add\", GrowthStageId: 0, MasterTypeId: 0}" })]
        public List<string>? ListPlan { get; set; }
    }
}
