using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CropRequest
{
    public class CropCreateRequest
    {
        public string? CropName { get; set; }

        public int Year { get; set; }

        public DateTime? CropExpectedTime { get; set; }

        public string? HarvestSeason { get; set; }

        public double? EstimateYield { get; set; }

        public string? Notes { get; set; }

        public int? FarmId { get; set; }

        public List<int> LandPlotId { get; set; } = new();
    }
}
