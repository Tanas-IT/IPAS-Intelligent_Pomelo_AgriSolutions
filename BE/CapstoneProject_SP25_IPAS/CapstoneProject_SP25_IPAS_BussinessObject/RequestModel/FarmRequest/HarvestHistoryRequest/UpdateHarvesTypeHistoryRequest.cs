using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest
{
    public class UpdateHarvesTypeHistoryRequest
    {
        [Required]
        public int MasterTypeId { get; set; }
        public int? PlantId { get; set; }
        public string? Unit { get; set; }
        
        public double? Price { get; set; }
        public int? Quantity { get; set; }
        [Required]
        public int? HarvestHistoryId { get; set; }
    }
}
