using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class GrowthStagePlan
    {
        public int GrowthStagePlanID { get; set; }
        public int? GrowthStageID { get; set; }
        public int? PlanID { get; set; }

        public virtual GrowthStage? GrowthStage { get; set; }
        public virtual Plan? Plan { get; set; }
    }
}
