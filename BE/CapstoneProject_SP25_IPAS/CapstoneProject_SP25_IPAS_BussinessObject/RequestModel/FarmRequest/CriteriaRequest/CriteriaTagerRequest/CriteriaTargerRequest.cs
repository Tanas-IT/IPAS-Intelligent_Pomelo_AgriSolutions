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
        
        public List<int>? PlantID { get; set; } = new List<int>();

        public List<int>? GraftedPlantID { get; set; } = new List<int>();

        public List<int>? PlantLotID { get; set; } = new List<int>();
        [Required]
        public List<CriteriaData> CriteriaData { get; set; } = new List<CriteriaData>();

        public bool allowOveride { get; set; } = false;
    }

 
}
