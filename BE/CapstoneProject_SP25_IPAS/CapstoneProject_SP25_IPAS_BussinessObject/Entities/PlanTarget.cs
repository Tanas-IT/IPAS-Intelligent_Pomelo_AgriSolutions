using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class PlanTarget
    {
        public int PlanTargetID { get; set; }
        public int? PlanID { get; set; }
        public int? LandRowID { get; set; }
        public int? LandPlotID { get; set; }
        public int? GraftedPlantID { get; set; }
        public int? PlantLotID { get; set; }
        public int? PlantID { get; set; }
        public string? Unit { get; set; }

        public virtual Plan? Plan { get; set; }    
        public virtual LandRow? LandRow { get; set; }    
        public virtual LandPlot? LandPlot { get; set; }    
        public virtual GraftedPlant? GraftedPlant { get; set; }    
        public virtual PlantLot? PlantLot { get; set; }    
        public virtual Plant? Plant { get; set; }    
    }
}
