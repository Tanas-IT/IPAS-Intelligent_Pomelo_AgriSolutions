using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest
{
    public class GetPlanOfTargetRequest
    {
        public int? PlantId { get; set; }
        public int? GraftedPlantId { get; set; }
        public int? PlantLotId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set;}
    }
}
