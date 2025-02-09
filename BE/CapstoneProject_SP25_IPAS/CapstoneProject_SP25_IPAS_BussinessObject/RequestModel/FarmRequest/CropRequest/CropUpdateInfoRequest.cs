using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest
{
    public class CropUpdateInfoRequest
    {
        [Required]
        public int CropId { get; set; }

        public string? CropName { get; set; }

        public int Year { get; set; }

        public DateTime? CropExpectedTime { get; set; }

        public DateTime? CropActualTime { get; set; }

        public string? HarvestSeason { get; set; }

        public double? EstimateYield { get; set; }

        public double? ActualYield { get; set; }

        public string? Notes { get; set; }

        public double? MarketPrice { get; set; }

    }
}
