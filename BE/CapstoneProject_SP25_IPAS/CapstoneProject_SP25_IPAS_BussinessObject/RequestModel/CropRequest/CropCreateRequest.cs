using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.CropRequest
{
    public class CropCreateRequest
    {
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Crop name must be between 3 and 255 characters.")]
        public string? CropName { get; set; }

        //public int Year { get; set; }

        public DateTime? CropExpectedTime { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? HarvestSeason { get; set; }

        public double? EstimateYield { get; set; }
        [StringLength(255, MinimumLength = 3, ErrorMessage = "Notes must be between 3 and 255 characters.")]
        public string? Notes { get; set; }

        public int? FarmId { get; set; }

        public List<int> LandPlotId { get; set; } = new();
    }
}
