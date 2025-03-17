using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class UpdateHarvestHistoryRequest
    {
        [Required]
        public int HarvestHistoryId { get; set; }

        public DateTime? DateHarvest { get; set; }

        public string? HarvestHistoryNote { get; set; }

        public double? TotalPrice { get; set; }

        public string? HarvestStatus { get; set; }

    }
}
