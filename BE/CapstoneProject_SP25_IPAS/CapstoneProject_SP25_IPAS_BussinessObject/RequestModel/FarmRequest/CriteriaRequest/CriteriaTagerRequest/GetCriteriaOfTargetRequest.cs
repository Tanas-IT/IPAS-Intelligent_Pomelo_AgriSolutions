using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest
{
    public class GetCriteriaOfTargetRequest
    {
        public int? PlantID { get; set; }

        public int? GraftedPlantID { get; set; } 

        public int? PlantLotID { get; set; }
    }
}
