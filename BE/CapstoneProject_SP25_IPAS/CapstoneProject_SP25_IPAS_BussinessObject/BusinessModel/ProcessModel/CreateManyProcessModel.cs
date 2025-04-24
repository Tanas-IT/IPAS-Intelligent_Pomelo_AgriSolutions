using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel
{
    public class CreateManyProcessModel
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
        public List<SubProcessCreateManyModel>? ListSubProcess { get; set; }
        public List<PlanCreateManyModel>? ListPlan { get; set; }

    }
    public class SubProcessCreateManyModel
    {
        public string SubProcessName { get; set; }
        public int ParentSubProcessId { get; set; }
        public bool IsDefault { get; set; }
        public bool IsActive { get; set; }
        public int MasterTypeId { get; set; }
        public List<PlanCreateManyModel> ListPlan { get; set; }
    }

    public class PlanCreateManyModel
    {
        public string PlanName { get; set; }
        public string PlanDetail { get; set; }
        public string PlanNote { get; set; }
        public int GrowthStageId { get; set; }
        public int MasterTypeId { get; set; }
    }
}
