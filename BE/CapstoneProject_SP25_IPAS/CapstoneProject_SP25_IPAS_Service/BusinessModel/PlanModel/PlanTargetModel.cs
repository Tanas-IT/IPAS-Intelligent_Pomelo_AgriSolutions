using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class PlanTargetModel
    {
        public List<int>? LandRowID { get; set; }
        public int? LandPlotID { get; set; }
        public List<int>? GraftedPlantID { get; set; }
        public List<int>? PlantLotID { get; set; }
        public List<int>? PlantID { get; set; }
        public string? Unit {  get; set; }
    }
}
