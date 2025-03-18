using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel
{
    public class UpdatePlanInProcessModel
    {
        public int? PlanId { get; set; }
        public string? PlanName { get; set; }
        public string? PlanDetail { get; set; }
        public string? PlanNote { get; set; }
        public int? GrowthStageId { get; set; }
        public int? MasterTypeId { get; set; }
        public string? PlanStatus { get; set; }
    }
}
