using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.GraftedModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.UserBsModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel
{
    public class LandPlotFilterModel
    {
        public int? LandPlotId { get; set; }               
        public string? LandPlotName { get; set; }          
        public string? Unit { get; set; }
        public int? FarmId { get; set; }
        public int? GrowthStageId { get; set; }
        public string? GrowthStageName { get; set; }

        public List<LandRowFilterModel> Rows { get; set; } = new();  // Danh sách Rows trong LandPlot
        public List<PlantFilterModel> Plants { get; set; } = new();  // Danh sách cây trồng trong LandPlot hoặc Row
        public List<PlantLotFilterModel> PlantLots { get; set; } = new();  // Danh sách lô cây trồng
        public List<GraftedPlantFilterModel> GraftedPlants { get; set; } = new();  // Danh sách cây ghép
    }
}
