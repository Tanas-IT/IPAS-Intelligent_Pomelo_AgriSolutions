using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class HarvestFilter
    {
        [FromQuery(Name = "dateHarvestFrom")]
        public DateTime? DateHarvestFrom { get; set; }

        [FromQuery(Name = "dateHarvestTo")]
        public DateTime? DateHarvestTo { get; set; }

        [FromQuery(Name = "totalPriceFrom")]
        public double? TotalPriceFrom { get; set; }

        [FromQuery(Name = "totalPriceTo")]
        public double? TotalPriceTo { get; set; }

        [FromQuery(Name = "status")]
        public string? Status { get; set; }
    }
}
