using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ProcessModel
{
    public class UpdateSubProcessModel
    {
        public int? SubProcessId {  get; set; }
        public string? SubProcessName { get; set; }

        public int? ParentSubProcessId { get; set; }

        public bool? IsDefault { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? MasterTypeId { get; set; }
        public string? Status { get; set; }
        public string? Order { get; set; }
        //[DefaultValue(new[] { "{PlanName: \"string\", PlanDetail: \"string\", PlanNote: \"string\", GrowthStageId: 0, MasterTypeId: 0}" })]
        public List<UpdatePlanInProcessModel>? ListPlan { get; set; }
    }
}
