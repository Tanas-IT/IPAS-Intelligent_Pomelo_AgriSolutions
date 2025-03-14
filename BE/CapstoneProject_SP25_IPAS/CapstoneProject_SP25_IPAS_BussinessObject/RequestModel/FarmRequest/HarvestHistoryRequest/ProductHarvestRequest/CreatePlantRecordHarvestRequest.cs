using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest.ProductHarvestRequest
{
    public class CreatePlantRecordHarvestRequest
    {
        [Required]
        public int MasterTypeId { get; set; }
        [Required]
        public int PlantId { get; set; }
        [Required]
        public int? Quantity { get; set; }
        [Required]
        public int? HarvestHistoryId { get; set; }
    }
}
