using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest
{
    public class CreatePlantRecordHarvestRequest
    {
        [Required]
        public int MasterTypeId { get; set; }
        [Required]
        public int? HarvestHistoryId { get; set; }
        public int? UserId { get; set; }
        public List<PlantRecord> plantHarvestRecords { get; set; } = new List<PlantRecord>();
    }
    public class PlantRecord
    {
        [Required]
        public int PlantId { get; set; }
        [Required]
        public int? Quantity { get; set; }
    }
}
