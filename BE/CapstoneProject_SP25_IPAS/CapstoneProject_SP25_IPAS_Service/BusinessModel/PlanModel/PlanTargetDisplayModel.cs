using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using Microsoft.Identity.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class PlanTargetDisplayModel
    {
        public List<LandRowDisplayModel>? Rows { get; set; }
        public string? LandPlotName { get; set; }
        public string? Unit {  get; set; }
        public List<GraftedPlantDisplayModel>? GraftedPlants { get; set; }
        public List<PlantLotDisplayModel>? PlantLots { get; set; }
        public List<PlantDisplayModel>? Plants { get; set; }
        public int? LandPlotId { get; set; }
    }

    public class LandRowDisplayModel
    {
        public int? LandRowId { get; set; }
        public int? RowIndex { get; set; }
    }

    public class PlantDisplayModel
    {
        public int? PlantId { get; set; }
        public string? PlantName { get; set; }
    }

    public class PlantLotDisplayModel
    {
        public int? PlantLotId { get; set; }
        public string? PlantLotName { get; set; }
    }

    public class GraftedPlantDisplayModel
    {
        public int? GraftedPlantId { get; set; }
        public string? GraftedPlantName { get; set; }
    }

}
