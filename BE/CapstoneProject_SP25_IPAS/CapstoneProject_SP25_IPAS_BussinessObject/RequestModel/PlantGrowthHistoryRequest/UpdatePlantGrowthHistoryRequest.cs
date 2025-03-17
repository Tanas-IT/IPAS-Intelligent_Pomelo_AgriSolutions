using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.ResourceRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlantGrowthHistoryRequest
{
    public class UpdatePlantGrowthHistoryRequest
    {
        [Required]
        public int PlantGrowthHistoryId { get; set; }

        public string? Content { get; set; }

        public string? IssueName { get; set; }


        public List<ResourceCrUpRequest> PlantResource = new();
    }
}
