using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class CreateProcessModel
    {
        public string? ProcessName { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? MasterTypeId { get; set; }
        public int? GrowthStageID { get; set; }
        public int? Order { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // Chuỗi JSON chứa danh sách SubProcess (trong mỗi SubProcess có danh sách Plan)
        [DefaultValue(new[] {
    "{SubProcessName: \"Sub 1\", ParentSubProcessId: 0, IsDefault: true, IsActive: true, MasterTypeId: 1, ListPlan: [{PlanName: \"Plan 1\", PlanDetail: \"Chi tiết 1\", PlanNote: \"Ghi chú 1\", GrowthStageId: 2, MasterTypeId: 3}]}"
})]
        public List<string>? ListSubProcess { get; set; }

        [DefaultValue(new[] { "{PlanName: \"string\", PlanDetail: \"string\", PlanNote: \"string\", GrowthStageId: 0, MasterTypeId: 0}" })]
        public List<string>? ListPlan { get; set; }
        
        public IFormFile? ProcessData { get; set; }

    }
}
