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
        [Range(0, double.MaxValue, ErrorMessage = "SellPrice must be greater than or equal to 0")]
        public double? SellPrice { get; set; }
        [Range(0, double.MaxValue, ErrorMessage = "CostPrice must be greater than or equal to 0")]
        public double? CostPrice { get; set; }
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Quantity must be greater than or equal to 1")]
        public double? QuantityNeed { get; set; }
        //public int? ProcessId { get; set; }
    }
}
