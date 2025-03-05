using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class UpdatePlanTargetModel
    {
        public int? LandRowID { get; set; }
        public int? LandPlotID { get; set; }
        public int? GraftedPlantID { get; set; }
        public int? PlantLotID { get; set; }
        public int? PlantID { get; set; }
        public int? PlanID { get; set; }
        public int? PlanTargetID { get; set; }
    }
}
