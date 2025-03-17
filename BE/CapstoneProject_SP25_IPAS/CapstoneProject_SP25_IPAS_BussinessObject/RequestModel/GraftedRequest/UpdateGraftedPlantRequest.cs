using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class UpdateGraftedPlantRequest
    {
        [Required]
        public int GraftedPlantId { get; set; }

        //public string? GraftedPlantCode { get; set; }

        public string? GraftedPlantName { get; set; }

        public string? GrowthStage { get; set; }

        public DateTime? SeparatedDate { get; set; }

        public string? Status { get; set; }

        public DateTime? GraftedDate { get; set; }

        public string? Note { get; set; }

        //public int? PlantId { get; set; }

        public int? PlantLotId { get; set; }
    }
}
