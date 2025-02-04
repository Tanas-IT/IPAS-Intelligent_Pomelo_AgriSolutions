using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantCriteriaRequest
{
    public class CheckPlantCriteriaRequest
    {
        public int PlantId { get; set; }
        public List<CriteriaData> criteriaDatas { get; set; } = new List<CriteriaData>();
        public int CriteriaTypeId { get; set; }
    }
}
