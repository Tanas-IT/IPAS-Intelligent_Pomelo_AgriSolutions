using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.PlantGrowthHistoryRequest
{
    public class PlantGrowthHistoryUpdateRequest
    {
        [Required]
        public int PlantGrowthHistoryId { get; set; }

        public string? Content { get; set; }

        public string? IssueName { get; set; }
    }
}
