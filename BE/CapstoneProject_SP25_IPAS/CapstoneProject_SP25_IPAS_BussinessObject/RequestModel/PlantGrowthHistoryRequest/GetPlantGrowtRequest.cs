using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantGrowthHistoryRequest
{
    public class GetPlantGrowtRequest
    {
        public int PlantId { get; set; }
        public DateTime? CreateFrom { get; set; }
        public DateTime? CreateTo { get; set; }

    }
}
