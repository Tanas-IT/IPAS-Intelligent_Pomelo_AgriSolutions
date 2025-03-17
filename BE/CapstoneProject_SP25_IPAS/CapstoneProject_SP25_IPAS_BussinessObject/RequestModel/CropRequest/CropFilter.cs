using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest
{
    public class CropFilter
    {
        [FromQuery(Name = "yearFrom")]
        public DateTime? DateFrom { get; set; }

        [FromQuery(Name = "yearTo")]
        public DateTime? DateTo { get; set; }

        [FromQuery(Name = "harvestSeason")]
        public string? HarvestSeason { get; set; }

        [FromQuery(Name = "actualYieldFrom")]
        public double? ActualYieldFrom { get; set; }

        [FromQuery(Name = "actualYieldTo")]
        public double? ActualYieldTo { get; set; }

        [FromQuery(Name = "status")]
        public string? Status { get; set; }

        [FromQuery(Name = "marketPriceFrom")]
        public double? MarketPriceFrom { get; set; }

        [FromQuery(Name = "marketPriceTo")]
        public int? MarketPriceTo { get; set; }
    }
}
