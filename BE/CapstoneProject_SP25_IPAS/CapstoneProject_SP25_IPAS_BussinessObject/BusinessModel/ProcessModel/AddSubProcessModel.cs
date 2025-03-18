using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel
{
    public class AddSubProcessModel
    {
        public string? SubProcessName { get; set; }
        public int? ParentSubProcessId { get; set; }
        public bool? IsDefault { get; set; } = true;
        public bool? IsActive { get; set; } = true;
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? MasterTypeId { get; set; } = 0;

        // Danh sách kế hoạch riêng cho từng SubProcess
        [DefaultValue(new[] { "{PlanName: \"string\", PlanDetail: \"string\", PlanNote: \"string\", GrowthStageId: 0, MasterTypeId: 0}" })]
        public List<string>? ListPlan { get; set; }
    }
}
