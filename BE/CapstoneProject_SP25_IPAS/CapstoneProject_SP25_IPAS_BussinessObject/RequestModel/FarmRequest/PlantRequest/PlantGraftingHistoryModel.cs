using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    public class PlantGraftingHistoryModel
    {
        public int PlantId { get; set; }
        public string? PlantName { get; set; }
        public int Generation { get; set; } // F0, F1, F2, ...
        public DateTime? PlantingDate { get; set; }
        public List<PlantGraftingHistoryModel>? ChildPlants { get; set; } = new List<PlantGraftingHistoryModel>();
    }
}
