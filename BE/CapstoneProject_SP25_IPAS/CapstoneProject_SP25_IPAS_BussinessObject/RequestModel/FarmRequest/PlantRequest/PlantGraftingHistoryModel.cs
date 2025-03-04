using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantRequest
{
    // 📜 Định nghĩa model trả về
    public class PlantGraftingHistoryResult
    {
        public int PlantId { get; set; }
        public string PlantName { get; set; }
        public int Generation { get; set; }
        public DateTime? PlantingDate { get; set; }
        public List<PlantGraftingHistoryModel> Ancestors { get; set; } = new List<PlantGraftingHistoryModel>();
        public List<PlantGraftingHistoryModel> Descendants { get; set; } = new List<PlantGraftingHistoryModel>();
    }

    public class PlantGraftingHistoryModel
    {
        public int PlantId { get; set; }
        public string PlantName { get; set; }
        public int Generation { get; set; }
        public DateTime? PlantingDate { get; set; }
        public List<PlantGraftingHistoryModel> ChildPlants { get; set; } = new List<PlantGraftingHistoryModel>();
    }

}
