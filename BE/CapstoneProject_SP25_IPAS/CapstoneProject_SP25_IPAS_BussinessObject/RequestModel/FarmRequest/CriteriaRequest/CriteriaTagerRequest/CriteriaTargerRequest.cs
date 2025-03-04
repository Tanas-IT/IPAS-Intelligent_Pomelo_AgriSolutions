using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest.CriteriaTagerRequest
{
    public class CriteriaTargerRequest
    {
        
        public List<int>? PlantId { get; set; } = new List<int>();

        public List<int>? GraftedPlantId { get; set; } = new List<int>();

        public List<int>? PlantLotId { get; set; } = new List<int>();
        [Required]
        public List<CriteriaData> CriteriaData { get; set; } = new List<CriteriaData>();

        public bool allowOveride { get; set; } = false;
    }

 
}
