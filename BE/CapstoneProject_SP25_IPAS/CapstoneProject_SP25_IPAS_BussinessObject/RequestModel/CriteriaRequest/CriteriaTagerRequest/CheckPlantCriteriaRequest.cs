using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest
{
    public class CheckPlantCriteriaRequest
    {
        public List<int> PlantIds { get; set; } = new List<int>();
        public List<CriteriaData> criteriaDatas { get; set; } = new List<CriteriaData>();

    }
}
