using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest.ProductHarvestRequest
{
    public class PlantHarvestFilter
    {
        [FromQuery(Name = "dateHarvestFrom")]
        public DateTime? DateHarvestFrom { get; set; }

        [FromQuery(Name = "dateHarvestTo")]
        public DateTime? DateHarvestTo { get; set; }

        [FromQuery(Name = "totalQuantityFrom")]
        public double? totalQuantityFrom { get; set; }

        [FromQuery(Name = "totalQuantityTo")]
        public double? totalQuantityTo { get; set; }
        [FromQuery(Name = "productIds")]
        public string? productIds { get; set; }
    }
}
