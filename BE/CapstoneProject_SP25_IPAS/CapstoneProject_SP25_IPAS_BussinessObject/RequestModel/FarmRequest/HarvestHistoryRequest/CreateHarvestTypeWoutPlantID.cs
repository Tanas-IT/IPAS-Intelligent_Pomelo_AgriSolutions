using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest
{
    public class CreateHarvestTypeWoutPlantID
    {
        [Required]
        public int MasterTypeId { get; set; }

        [Required]
        public string? Unit { get; set; }

        public double? Price { get; set; }
        [Required]
        public int? Quantity { get; set; }
        public int? ProcessId { get; set; }
    }
}
