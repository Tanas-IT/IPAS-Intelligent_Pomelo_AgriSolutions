using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class PlanTargetDisplayModel
    {
        public List<string>? RowIndex { get; set; }
        public string? LandPlotName { get; set; }
        public List<string>? GraftedPlantName { get; set; }
        public List<string>? PlantLotName { get; set; }
        public List<string>? PlantName { get; set; }
        public int? PlantTargetId { get; set; }
    }
}
