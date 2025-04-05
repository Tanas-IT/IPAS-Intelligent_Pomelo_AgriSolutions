using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class CreateHarvestTypeHistoryRequest
    {
        [Required]
        public int MasterTypeId { get; set; }

        [Required]
        public string? Unit { get; set; }

        public double? SellPrice { get; set; }
        public double? CostPrice { get; set; }
        [Required]
        public int? Quantity { get; set; }

        public int? HarvestHistoryId { get; set; }
    }
}
