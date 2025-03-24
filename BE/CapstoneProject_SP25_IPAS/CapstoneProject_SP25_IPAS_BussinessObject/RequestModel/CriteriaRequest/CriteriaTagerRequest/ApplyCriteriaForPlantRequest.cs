using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest
{
    public class ApplyCriteriaForPlantRequest
    {
        public List<int> PlantIds { get; set; } = new List<int>();

        [Required]
        public List<CriteriaData> CriteriaData { get; set; } = new List<CriteriaData>();

    }
}
