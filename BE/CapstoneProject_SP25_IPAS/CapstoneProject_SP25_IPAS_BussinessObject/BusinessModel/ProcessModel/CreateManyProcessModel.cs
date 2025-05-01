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
        public bool? IsSample { get; set; }
        public int? MasterTypeId { get; set; }
        public int? PlanTargetInProcess { get; set; } // có 3 giá trị: 1 là LandPlot/Row/Plant, 2 là PlantLot, 3 là GraftedPlant

        // Chuỗi JSON chứa danh sách SubProcess (trong mỗi SubProcess có danh sách Plan)
        public List<SubProcessCreateManyModel>? ListSubProcess { get; set; }
        public List<PlanCreateManyModel>? ListPlan { get; set; }

    }
    public class SubProcessCreateManyModel
    {
        public int? SubProcessId { get; set; }
        public string? SubProcessName { get; set; }
        public int? ParentSubProcessId { get; set; }
        public bool? IsActive { get; set; }
        public int? Order { get; set; }
        public List<PlanCreateManyModel>? ListPlan { get; set; }
    }

    public class PlanCreateManyModel
    {
        public string? PlanName { get; set; }
        public string? PlanDetail { get; set; }
        public string? PlanNote { get; set; }
    }
}
