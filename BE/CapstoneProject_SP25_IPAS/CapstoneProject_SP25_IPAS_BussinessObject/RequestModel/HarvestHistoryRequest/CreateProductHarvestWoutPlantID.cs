using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class CreateProductHarvestWoutPlantID
    {
        [Required]
        public int MasterTypeId { get; set; }

        [Required]
        public string? Unit { get; set; }

        public double? SellPrice { get; set; }
        [Required]
        public int? QuantityNeed { get; set; }
        //public int? ProcessId { get; set; }
    }
}
