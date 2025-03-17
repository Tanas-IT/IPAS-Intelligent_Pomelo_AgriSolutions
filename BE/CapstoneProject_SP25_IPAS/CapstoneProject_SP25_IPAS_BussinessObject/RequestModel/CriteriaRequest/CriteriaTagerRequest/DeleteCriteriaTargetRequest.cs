using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CriteriaRequest.CriteriaTagerRequest
{
    public class DeleteCriteriaTargetRequest
    {
        public List<int?>? PlantId { get; set; } = new List<int?>();

        public List<int?>? GraftedPlantId { get; set; } = new List<int?>();

        public List<int?>? PlantLotId { get; set; } = new List<int?>();
        [Required]
        public List<int> CriteriaSetId { get; set; } = new List<int>();

        public bool clearAllCriteria { get; set; } = false;
    }
}
