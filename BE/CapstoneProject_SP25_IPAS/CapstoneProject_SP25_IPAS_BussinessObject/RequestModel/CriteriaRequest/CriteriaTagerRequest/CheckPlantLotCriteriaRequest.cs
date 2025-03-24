using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest
{
    public class CheckPlantLotCriteriaRequest
    {
        public int PlantLotID { get; set; }
        [Required]
        public List<CriteriaData> criteriaDatas { get; set; } = new List<CriteriaData>();
    }
}
