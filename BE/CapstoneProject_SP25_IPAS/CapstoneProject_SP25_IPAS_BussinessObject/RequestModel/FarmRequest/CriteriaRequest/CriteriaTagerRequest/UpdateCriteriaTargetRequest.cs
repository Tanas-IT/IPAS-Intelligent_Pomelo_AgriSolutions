using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest
{
    public class UpdateCriteriaTargetRequest
    {
        public int? PlantID { get; set; }

        public int? GraftedPlantID { get; set; }

        public int? PlantLotID { get; set; }
        [Required]
        public List<CriteriaData> CriteriaData { get; set; } = new List<CriteriaData>();

        public bool allowOveride { get; set; }  = false;
    }
}
