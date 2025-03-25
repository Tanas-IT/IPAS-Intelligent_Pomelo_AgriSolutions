using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.GraftedRequest
{
    public class CreateGraftedPlantRequest
    {
        //public string? GraftedPlantName { get; set; }

        //public string? GrowthStage { get; set; }

        //public DateTime? SeparatedDate { get; set; }

        //public string? Status { get; set; }
        public int TotalNumber { get; set; } = 1;
        public DateTime? GraftedDate { get; set; }

        public string? Note { get; set; }
        [Required]
        public int PlantId { get; set; }
    }
}
